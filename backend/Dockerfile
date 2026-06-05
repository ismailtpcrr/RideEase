FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

COPY ArabaKiralama.sln .
COPY ArabaKiralama.Entities/ ArabaKiralama.Entities/
COPY ArabaKiralama.Business/ ArabaKiralama.Business/
COPY ArabaKiralama.DataAccess/ ArabaKiralama.DataAccess/
COPY ArabaKiralama.WebAPI/ ArabaKiralama.WebAPI/

RUN dotnet publish ArabaKiralama.WebAPI/ArabaKiralama.WebAPI.csproj \
    -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app

COPY --from=build /app/publish .

EXPOSE 8080
ENTRYPOINT ["dotnet", "ArabaKiralama.WebAPI.dll"]