using System.Reflection;
using EfCoreRepository.Interfaces;
using Logic.Attributes;
using Logic.Dtos.GlobalConfig;
using Logic.Interfaces;
using Models.Entities;

namespace Logic.Services;

public class GlobalConfigService(IEfRepository repository) : IGlobalConfigService
{
    private readonly IBasicCrud<GlobalConfig> _crud = repository.For<GlobalConfig>();

    public async Task<GlobalConfigModel> GetAllAsync()
    {
        var (model, _) = await BuildAsync(publicOnly: false);
        return model;
    }

    public async Task UpdateAsync(GlobalConfigModel config)
    {
        var rows = (await _crud.GetAll()).ToList();

        foreach (var property in typeof(GlobalConfigModel).GetProperties())
        {
            if (IsReadOnly(property))
            {
                continue;
            }

            var columnName = GetColumnName(property);
            var rawValue = property.GetValue(config)?.ToString() ?? string.Empty;
            var row = rows.FirstOrDefault(r => r.Key == columnName);

            if (row is not null)
            {
                await _crud.Update(row.Id, r => r.Value = rawValue);
            }
            else
            {
                await _crud.Save(new GlobalConfig { Key = columnName, Value = rawValue });
            }
        }
    }

    public async Task<Dictionary<string, object>> GetPublicAsync()
    {
        var (_, values) = await BuildAsync(publicOnly: true);
        return values.ToDictionary(x => ToCamelCase(x.Key), x => x.Value);
    }

    private async Task<(GlobalConfigModel model, Dictionary<string, object> values)> BuildAsync(bool publicOnly)
    {
        var rows = (await _crud.GetAll()).ToDictionary(r => r.Key, r => r.Value);
        var model = new GlobalConfigModel();
        var values = new Dictionary<string, object>();

        foreach (var property in typeof(GlobalConfigModel).GetProperties())
        {
            if (publicOnly && !IsPublic(property))
            {
                continue;
            }

            var columnName = GetColumnName(property);

            if (rows.TryGetValue(columnName, out var raw))
            {
                var typed = ConvertValue(property.PropertyType, raw);
                values[property.Name] = typed;

                if (property.CanWrite)
                {
                    property.SetValue(model, typed);
                }
            }
            else if (IsReadOnly(property))
            {
                values[property.Name] = property.GetValue(model)!;
            }
        }

        return (model, values);
    }

    private static string GetColumnName(PropertyInfo property) =>
        property.GetCustomAttribute<GlobalConfigColAttribute>()?.Name
        ?? throw new InvalidOperationException($"Missing GlobalConfigCol name for {property.Name}.");

    private static bool IsPublic(PropertyInfo property) =>
        property.GetCustomAttribute<GlobalConfigColAttribute>()?.Public ?? false;

    private static bool IsReadOnly(PropertyInfo property) =>
        property.GetCustomAttribute<GlobalConfigColAttribute>()?.ReadOnly ?? false;

    private static object ConvertValue(Type targetType, string value) => targetType switch
    {
        _ when targetType == typeof(string) => value,
        _ when targetType == typeof(int) => int.Parse(value),
        _ when targetType == typeof(bool) => bool.Parse(value),
        _ when targetType == typeof(Uri) => new Uri(value),
        _ => throw new NotSupportedException($"Unsupported config type {targetType.Name}.")
    };

    private static string ToCamelCase(string value) =>
        string.IsNullOrEmpty(value) || char.IsLower(value[0])
            ? value
            : char.ToLowerInvariant(value[0]) + value[1..];
}
