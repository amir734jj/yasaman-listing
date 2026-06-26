using Logic.Dtos.GlobalConfig;

namespace Logic.Interfaces;

public interface IGlobalConfigService
{
    Task<GlobalConfigModel> GetAllAsync();

    Task UpdateAsync(GlobalConfigModel config);

    Task<Dictionary<string, object>> GetPublicAsync();
}
