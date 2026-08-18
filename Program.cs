using Microsoft.EntityFrameworkCore;
using backend.Repositories;
using backend.Data;
using MobilArayuz.API.Repositories;

var builder = WebApplication.CreateBuilder(args);

// 1. Servisleri buraya ekle (Build'den önce)
builder.Services.AddSwaggerGen();
builder.Services.AddControllers(); // Controller'ları sisteme tanıttık

// Veritabanı ve Repository bağlantıları
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddMemoryCache(); 
builder.Services.AddScoped<DashboardRepository>();
builder.Services.AddScoped<AuthRepository>();
builder.Services.AddScoped<PersonnelRepository>();
builder.Services.AddScoped<AuditLogRepository>();
builder.Services.AddScoped<AnnouncementRepository>();
builder.Services.AddScoped<AttendanceRepository>();
builder.Services.AddScoped<LeaveRequestRepository>();
builder.Services.AddScoped<OvertimeRepository>();
builder.Services.AddScoped<ReportRepository>();
builder.Services.AddScoped<IProfileRepository, ProfileRepository>();
builder.Services.AddScoped<LocationRepository>();
builder.Services.AddScoped<AttendanceRepository>();

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

// 2. HTTP istek hattı (Build'  den sonra)
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors(); //fetch hatası almamak için controllers öncesi usecors kullandım


//app.UseHttpsRedirection();
app.MapControllers(); // API endpoint'lerini haritalar

// Örnek hava durumu (istersen silebilirsin)
app.MapGet("/weatherforecast", () =>
{
    var summaries = new[] { "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching" };
    return Enumerable.Range(1, 5).Select(index =>
        new WeatherForecast(
            DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
            Random.Shared.Next(-20, 55),
            summaries[Random.Shared.Next(summaries.Length)]
        ))
        .ToArray();
})
.WithName("GetWeatherForecast");



app.Run();

record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}