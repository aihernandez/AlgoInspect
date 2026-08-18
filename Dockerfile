FROM node:24-bookworm-slim AS web-build
WORKDIR /src
COPY package.json package-lock.json ./
RUN npm ci
COPY src/frontend ./src/frontend
COPY scripts/generate-brand-icons.mjs scripts/build-web-vendor.mjs ./scripts/
RUN npm run build:web

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS dotnet-build
WORKDIR /src
COPY . .
COPY --from=web-build /src/src/frontend/public/generated ./src/frontend/public/generated
COPY --from=web-build /src/src/frontend/public/vendor ./src/frontend/public/vendor
RUN dotnet restore ./src/backend/AlgoInspect.Api/AlgoInspect.Api.csproj
RUN dotnet publish ./src/backend/AlgoInspect.Api/AlgoInspect.Api.csproj \
    --configuration Release \
    --no-restore \
    --output /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
ENV ASPNETCORE_URLS=http://+:8080 \
    ASPNETCORE_ENVIRONMENT=Production
EXPOSE 8080
COPY --from=dotnet-build /app/publish .
USER $APP_UID
ENTRYPOINT ["dotnet", "AlgoInspect.Api.dll"]
