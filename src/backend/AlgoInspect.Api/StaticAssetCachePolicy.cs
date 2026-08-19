using Microsoft.AspNetCore.StaticFiles;

namespace AlgoInspect.Api;

internal static class StaticAssetCachePolicy
{
    public static void Apply(StaticFileResponseContext context)
    {
        // Los archivos se sirven con rutas estables, sin hash de contenido. Por ello no
        // pueden tener una vida de caché prolongada: el navegador debe revalidarlos
        // para que una edición local o un despliegue sea visible al recargar.
        context.Context.Response.Headers.CacheControl = "no-cache";
    }
}
