using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Data;

public class AppDbContext : DbContext 
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
    
    public DbSet<Profile> profiles { get; set; } 
    public DbSet<Attendance> Attendances { get; set; }
    public DbSet<Location> Locations { get; set; }
    public DbSet<OvertimeRecord> OvertimeRecords { get; set; }
    public DbSet<LeaveRequest> LeaveRequests { get; set; }
    public DbSet<AuditLog> AuditLogs { get; set; }
    public DbSet<Announcement> Announcements { get; set; } 

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Profile>().ToTable("profiles");
        modelBuilder.Entity<Attendance>().ToTable("attendance");
        modelBuilder.Entity<OvertimeRecord>().ToTable("overtime_records");
        modelBuilder.Entity<LeaveRequest>().ToTable("leave_requests");
        modelBuilder.Entity<AuditLog>().ToTable("audit_logs");
        modelBuilder.Entity<Announcement>().ToTable("announcements");
    }
}