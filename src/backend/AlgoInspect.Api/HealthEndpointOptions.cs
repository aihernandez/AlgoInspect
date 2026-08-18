using System.Text.Json;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace AlgoInspect.Api;

internal static class HealthEndpointOptions
{
    private static readonly JsonSerializerOptions s_jsonOptions = new(JsonSerializerDefaults.Web);

    public static HealthCheckOptions Readiness { get; } = new()
    {
        Predicate = registration => registration.Tags.Contains("ready"),
        ResponseWriter = WriteResponseAsync,
    };

    public static HealthCheckOptions Liveness { get; } = new()
    {
        Predicate = _ => false,
        ResponseWriter = WriteResponseAsync,
    };

    private static Task WriteResponseAsync(HttpContext context, HealthReport report)
    {
        context.Response.ContentType = "application/json; charset=utf-8";
        var payload = new
        {
            status = report.Status.ToString().ToLowerInvariant(),
            checks = report.Entries.Select(entry => new
            {
                name = entry.Key,
                status = entry.Value.Status.ToString().ToLowerInvariant(),
                description = entry.Value.Description,
                data = entry.Value.Data,
            }),
        };

        return context.Response.WriteAsync(JsonSerializer.Serialize(payload, s_jsonOptions));
    }
}
