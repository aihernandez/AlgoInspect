FROM node:24-bookworm-slim AS web-build
WORKDIR /src
COPY package.json package-lock.json ./
RUN npm ci
COPY src/frontend ./src/frontend
COPY scripts/build-web-vendor.mjs ./scripts/
# Los iconos de marca estan versionados en src/frontend/public/assets/icons y
# se generan con Playwright, que no tiene navegador en esta etapa. Aqui solo se
# construye lo que no se versiona: la hoja de estilos y las dependencias del
# navegador.
RUN npm run build:css && npm run build:vendor

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
