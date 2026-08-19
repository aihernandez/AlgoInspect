namespace AlgoInspect.Api;

/// <summary>
/// Telemetría opcional hacia Sentry.
/// </summary>
/// <remarks>
/// Está desactivada por defecto. El principio 5 de la visión del producto pide que
/// cualquier envío externo sea explícito, así que quien clone el repositorio y lo
/// ejecute no envía nada: hay que habilitarlo a conciencia.
///
/// La cobertura es solo de servidor. El SDK de navegador exigiría abrir
/// <c>connect-src</c> en la política de seguridad de contenido, y esa decisión
/// afecta a los visitantes, no a quien despliega.
/// </remarks>
internal static class TelemetryConfiguration
{
    public static WebApplicationBuilder AddOptionalTelemetry(this WebApplicationBuilder builder)
    {
        if (!builder.Configuration.GetValue<bool>("Telemetry:Enabled"))
        {
            return builder;
        }

        string? dsn = builder.Configuration["Telemetry:Dsn"];
        if (string.IsNullOrWhiteSpace(dsn))
        {
            throw new InvalidOperationException(
                "Telemetry:Enabled es true pero Telemetry:Dsn está vacío. " +
                "Configurar el DSN del proyecto de Sentry o desactivar la telemetría.");
        }

        double tracesSampleRate = builder.Configuration.GetValue("Telemetry:TracesSampleRate", 0.2);
        if (tracesSampleRate is < 0 or > 1)
        {
            throw new InvalidOperationException(
                "Telemetry:TracesSampleRate debe estar entre 0 y 1.");
        }

        builder.WebHost.UseSentry(options =>
        {
            options.Dsn = dsn;
            options.Environment = builder.Environment.EnvironmentName;

            // El catálogo es contenido público y no hay usuarios autenticados que
            // identificar, así que no se recoge ningún dato personal.
            options.SendDefaultPii = false;

            options.TracesSampleRate = tracesSampleRate;
            options.MaxBreadcrumbs = 50;
        });

        return builder;
    }
}
