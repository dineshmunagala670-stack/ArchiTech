FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["ArchiTechDotnetApi/ArchiTechDotnetApi.csproj", "ArchiTechDotnetApi/"]
RUN dotnet restore "ArchiTechDotnetApi/ArchiTechDotnetApi.csproj"
COPY . .
WORKDIR "/src/ArchiTechDotnetApi"
RUN dotnet build "ArchiTechDotnetApi.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "ArchiTechDotnetApi.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=publish /app/publish .
EXPOSE 8080
ENTRYPOINT ["dotnet", "ArchiTechDotnetApi.dll"]