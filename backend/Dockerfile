# Multi-stage Dockerfile for TeacherTech .NET 9 Web API
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 8080
ENV ASPNETCORE_HTTP_PORTS=8080
ENV ASPNETCORE_ENVIRONMENT=Production

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy project files for dependency restore caching
COPY ["src/TeacherTech.Api/TeacherTech.Api.csproj", "src/TeacherTech.Api/"]
COPY ["src/TeacherTech.Application/TeacherTech.Application.csproj", "src/TeacherTech.Application/"]
COPY ["src/TeacherTech.Domain/TeacherTech.Domain.csproj", "src/TeacherTech.Domain/"]
COPY ["src/TeacherTech.Infrastructure/TeacherTech.Infrastructure.csproj", "src/TeacherTech.Infrastructure/"]

RUN dotnet restore "src/TeacherTech.Api/TeacherTech.Api.csproj"

# Copy source code and build
COPY . .
WORKDIR "/src/src/TeacherTech.Api"
RUN dotnet build "TeacherTech.Api.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "TeacherTech.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "TeacherTech.Api.dll"]
