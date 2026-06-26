using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace Api.Extensions;

/// <summary>
/// The media upload endpoint streams the multipart body manually instead of binding an
/// <c>IFormFile</c>, so Swashbuckle can't infer the file parameter. This filter documents the
/// <c>file</c> multipart field so the generated client keeps its file upload contract.
/// </summary>
public class FileUploadOperationFilter : IOperationFilter
{
    public void Apply(OpenApiOperation operation, OperationFilterContext context)
    {
        var isAddMedia = context.MethodInfo.DeclaringType == typeof(Controllers.ListingController)
            && context.MethodInfo.Name == nameof(Controllers.ListingController.AddMedia);
        if (!isAddMedia)
        {
            return;
        }

        operation.RequestBody = new OpenApiRequestBody
        {
            Content =
            {
                ["multipart/form-data"] = new OpenApiMediaType
                {
                    Schema = new OpenApiSchema
                    {
                        Type = "object",
                        Required = new HashSet<string> { "file" },
                        Properties =
                        {
                            ["file"] = new OpenApiSchema
                            {
                                Type = "string",
                                Format = "binary"
                            }
                        }
                    }
                }
            }
        };
    }
}
