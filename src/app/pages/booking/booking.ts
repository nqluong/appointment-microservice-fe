import { Component, OnInit, OnDestroy, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DoctorDetail, TimeSlot } from '../../core/models/doctor.model';
import { DoctorService } from '../../core/services/doctor.service';

declare var $: any;

interface GroupedSlotsByDate {
  [date: string]: TimeSlot[];
}

interface CalendarDay {
  date: number;
  fullDate: string;
  isCurrentMonth: boolean;
  hasSlots: boolean;
  isSelected: boolean;
  isToday: boolean;
}

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './booking.html',
  styleUrl: './booking.css'
})
export class Booking implements OnInit, OnDestroy{
  doctor: DoctorDetail | null = null;
  loading = true;
  error: string | null = null;
  selectedSlot: TimeSlot | null = null;
  selectedDate: string | null = null;
  groupedSlots: GroupedSlotsByDate = {};
  availableDates: string[] = [];
  calendarDays: CalendarDay[] = [];
  currentMonth: Date = new Date();
  currentMonthYear: string = '';
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private doctorService: DoctorService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.updateCalendar();
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const doctorId = params['doctorId'];
        const slotId = params['slotId'];
        
        if (doctorId) {
          this.loadDoctorDetail(doctorId, slotId);
        } else {
          this.error = 'Không tìm thấy thông tin bác sĩ';
          this.loading = false;
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadDoctorDetail(userId: string, preSelectedSlotId?: string): void {
    this.loading = true;
    this.error = null;

    this.doctorService.getDoctorDetail(userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (doctor) => {
          this.doctor = doctor;
          this.groupSlotsByDate();
          this.updateCalendar();
          
          // Pre-select slot if provided
          if (preSelectedSlotId) {
            this.selectedSlot = doctor.availableSlots.find(s => s.slotId === preSelectedSlotId) || null;
          }
          
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Error loading doctor detail:', err);
          this.error = 'Không thể tải thông tin bác sĩ. Vui lòng thử lại sau.';
          this.loading = false;
          this.cdr.markForCheck();
        }
      });
  }

  private groupSlotsByDate(): void {
    if (!this.doctor?.availableSlots) return;

    // Remove duplicates based on slotId before grouping
    const uniqueSlots = this.doctor.availableSlots.filter((slot, index, self) =>
      index === self.findIndex((s) => s.slotId === slot.slotId)
    );

    console.log('Original slots:', this.doctor.availableSlots.length);
    console.log('Unique slots:', uniqueSlots.length);

    this.groupedSlots = uniqueSlots.reduce((acc, slot) => {
      if (!acc[slot.slotDate]) {
        acc[slot.slotDate] = [];
      }
      acc[slot.slotDate].push(slot);
      return acc;
    }, {} as GroupedSlotsByDate);

    this.availableDates = Object.keys(this.groupedSlots).sort();
  }

  private formatDateToString(year: number, month: number, day: number): string {
    const y = year;
    const m = String(month + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  private updateCalendar(): void {
    const year = this.currentMonth.getFullYear();
    const month = this.currentMonth.getMonth();
    
    // Update month year display
    this.currentMonthYear = new Intl.DateTimeFormat('vi-VN', { 
      month: 'long', 
      year: 'numeric' 
    }).format(this.currentMonth);

    // First day of the month
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // Start from previous month's days to fill the first week
    const startDay = firstDay.getDay(); // 0 = Sunday
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    
    this.calendarDays = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Previous month days
    for (let i = startDay - 1; i >= 0; i--) {
      const date = daysInPrevMonth - i;
      const fullDate = this.formatDateToString(year, month - 1, date);
      this.calendarDays.push({
        date,
        fullDate,
        isCurrentMonth: false,
        hasSlots: this.availableDates.includes(fullDate),
        isSelected: this.selectedDate === fullDate,
        isToday: false
      });
    }

    // Current month days
    const daysInMonth = lastDay.getDate();
    for (let date = 1; date <= daysInMonth; date++) {
      const fullDate = this.formatDateToString(year, month, date);
      const dateObj = new Date(year, month, date);
      dateObj.setHours(0, 0, 0, 0);
      
      this.calendarDays.push({
        date,
        fullDate,
        isCurrentMonth: true,
        hasSlots: this.availableDates.includes(fullDate),
        isSelected: this.selectedDate === fullDate,
        isToday: dateObj.getTime() === today.getTime()
      });
    }

    // Next month days to complete the grid (42 days = 6 weeks)
    const remainingDays = 42 - this.calendarDays.length;
    for (let date = 1; date <= remainingDays; date++) {
      const fullDate = this.formatDateToString(year, month + 1, date);
      this.calendarDays.push({
        date,
        fullDate,
        isCurrentMonth: false,
        hasSlots: this.availableDates.includes(fullDate),
        isSelected: this.selectedDate === fullDate,
        isToday: false
      });
    }
  }

  previousMonth(): void {
    this.currentMonth = new Date(
      this.currentMonth.getFullYear(),
      this.currentMonth.getMonth() - 1,
      1
    );
    this.updateCalendar();
    this.cdr.markForCheck();
  }

  nextMonth(): void {
    this.currentMonth = new Date(
      this.currentMonth.getFullYear(),
      this.currentMonth.getMonth() + 1,
      1
    );
    this.updateCalendar();
    this.cdr.markForCheck();
  }

  canGoPreviousMonth(): boolean {
    const today = new Date();
    const firstDayCurrentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const firstDayPrevMonth = new Date(
      this.currentMonth.getFullYear(),
      this.currentMonth.getMonth() - 1,
      1
    );
    return firstDayPrevMonth >= firstDayCurrentMonth;
  }

  canGoNextMonth(): boolean {
    // Allow navigation up to 3 months ahead
    const today = new Date();
    const maxMonth = new Date(today.getFullYear(), today.getMonth() + 3, 1);
    const nextMonth = new Date(
      this.currentMonth.getFullYear(),
      this.currentMonth.getMonth() + 1,
      1
    );
    return nextMonth <= maxMonth;
  }

  selectDate(day: CalendarDay): void {
    if (!day.isCurrentMonth || !day.hasSlots) return;
    
    this.selectedDate = day.fullDate;
    this.selectedSlot = null;
    this.updateCalendar();
    this.cdr.markForCheck();
  }

  getSlotsByTimeOfDay(period: 'morning' | 'afternoon' | 'evening'): TimeSlot[] {
    if (!this.selectedDate || !this.groupedSlots[this.selectedDate]) {
      return [];
    }

    const slots = this.groupedSlots[this.selectedDate];
    
    return slots.filter(slot => {
      const hour = parseInt(slot.startTime.split(':')[0]);
      
      if (period === 'morning') {
        return hour >= 0 && hour < 12;
      } else if (period === 'afternoon') {
        return hour >= 12 && hour < 18;
      } else { // evening
        return hour >= 18 && hour < 24;
      }
    }).sort((a, b) => a.startTime.localeCompare(b.startTime));
  }

  getSlotsByDate(date: string): TimeSlot[] {
    return this.groupedSlots[date] || [];
  }

  selectSlot(slot: TimeSlot): void {
    if (slot.isAvailable) {
      this.selectedSlot = slot;
      this.cdr.markForCheck();
    }
  }

  isSlotSelected(slot: TimeSlot): boolean {
    return this.selectedSlot?.slotId === slot.slotId;
  }

  proceedToCheckout(): void {
    if (this.selectedSlot && this.doctor) {
      // Navigate to checkout with booking details
      this.router.navigate(['/checkout'], {
        queryParams: {
          doctorId: this.doctor.userId,
          slotId: this.selectedSlot.slotId
        }
      });
    }
  }

  formatDate(dateString: string): string {
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('vi-VN', { 
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  formatDateShort(dateString: string): string {
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('vi-VN', { 
      day: '2-digit',
      month: 'short'
    });
  }

  getDayOfWeek(dateString: string): string {
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    return days[date.getDay()];
  }

  getYear(dateString: string): string {
    const [year] = dateString.split('-').map(Number);
    return year.toString();
  }

  formatTime(timeString: string): string {
    return timeString.substring(0, 5);
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  }
}
