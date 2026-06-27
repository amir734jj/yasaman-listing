FROM mcr.microsoft.com/dotnet/sdk:10.0-alpine AS backend-build
ARG BUILD_CONFIGURATION=Release
ENV DOTNET_NUGET_SIGNATURE_VERIFICATION=false
WORKDIR /src
COPY api .
RUN dotnet restore Api/Api.csproj && \
    dotnet publish Api/Api.csproj -c $BUILD_CONFIGURATION -o /app/out --no-restore

FROM node:lts-alpine AS frontend-build
WORKDIR /app
COPY ui .
RUN npm ci && npm run build

FROM mcr.microsoft.com/dotnet/aspnet:10.0-alpine AS final
WORKDIR /app

ENV ASPNETCORE_URLS=http://+:80
ENV ASPNETCORE_ENVIRONMENT=Production

RUN apk add --no-cache icu-libs tzdata

COPY --from=backend-build /app/out .
COPY --from=frontend-build /app/dist ./wwwroot

EXPOSE 80
ENTRYPOINT ["dotnet", "Api.dll"]
