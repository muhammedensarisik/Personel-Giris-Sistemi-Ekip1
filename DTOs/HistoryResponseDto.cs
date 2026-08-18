using System;

namespace backend.DTOs
{
    public class HistoryResponseDto
    {
        public required string Date { get; set; }
        public required string CheckIn { get; set; }
        public required string CheckOut { get; set; }
        public required string Status { get; set; }
        public int Duration { get; set; }
        public bool IsHoliday { get; set; } 
        public required string HolidayName { get; set; } 
    }
}