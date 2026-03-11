# Sử dụng official .NET runtime image cho production
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 8080

# Sử dụng SDK image để build application với Node.js
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src

# Cài đặt Node.js và npm (cần cho ClientApp)
RUN apt-get update && \
    apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    rm -rf /var/lib/apt/lists/*

# Copy project file và restore dependencies trước
# Điều này tận dụng Docker layer caching - chỉ rebuild khi dependencies thay đổi
COPY ["SHN-Gear.csproj", "."]
RUN dotnet restore "./SHN-Gear.csproj"

# Copy toàn bộ source code và build
COPY . .
WORKDIR "/src/."
RUN dotnet build "./SHN-Gear.csproj" -c $BUILD_CONFIGURATION -o /app/build

# Publish application
FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "./SHN-Gear.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

# Final stage: copy published app vào runtime image
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .

# Tạo non-root user cho security
RUN adduser --disabled-password --gecos '' appuser && chown -R appuser /app
USER appuser

ENTRYPOINT ["dotnet", "SHN-Gear.dll"]
