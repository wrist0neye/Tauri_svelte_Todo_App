<script lang="ts">
/**
 * 이 페이지에서 구현할 내용은
 * calendar 년,월,주,일 전환 기능
 * 달력에서 range 설정하기
 * 달력에서 복수의 날짜 설정하기
 * Gnatt chart 그릴 것
*/
    import {onMount} from "svelte";
    import YearView from "$root/components/calendar/YearView.svelte"
    import QuarterView from "$root/components/calendar/QuarterView.svelte"
    import MonthView from "$root/components/calendar/MonthView.svelte"
    import WeekView from "$root/components/calendar/WeekView.svelte"
    import DayView from "$root/components/calendar/DayView.svelte"
    import HourView from "$root/components/calendar/HourView.svelte"
    import EventModal from "$root/components/calendar/EventModal.svelte"
    import {Schedule, viewMode} from "$root/types/calendar.ts"
    
    // Calendar state
    let currentDate = new Date();
    let selectedDate = new Date();
    let currentView = "month"; // default mode
    let showEventModal = false;
    let eventData : Schedule = {
        id: null,
        title: "",
        content: "",
        startDate: new Date(),
        endDate: new Date()
    }

    // collection of events
    let events = [];

    // View Options
    const viewOptions : viewMode[] = [
        {"id" : "year", "label" : "연"},        
        {"id" : "quarter", "label" : "분기"},        
        {"id" : "month", "label" : "월"},
        {"id" : "week", "label" : "주"},
        {"id" : "day", "label" : "일"},
        {"id" : "hour", "label" : "시간"}
    ]

    // Load events from localStorage
    onMount(()=> {
      // components/Todos.svelte, stores/useStorage.ts 참고할 것  
    })

    // Navigation functions
    function navigate(amount : number) {
        switch(currentView) {
            case 'year' :
                currentDate.setFullYear(amount)
                break;
            case 'quarter' :
                currentDate.setMonth(amount*3)
                break;
            case 'month' : 
                currentDate.setMonth(amount)
                break;
            case 'week' :
                currentDate.setDate(amount*7)
                break;
            case 'day' :
                currentDate.setDate(amount)
                break;
            case 'hour' : 
                currentDate.setHours(amount)
        }
        currentDate = new Date(currentDate)
    }

    function goToToday() {
        currentDate = new Date();
    }
</script>

<div class="calendar-container">
    <div class="calendar-header">
      <div class="calendar-nav">
        <button on:click={() => navigate(-1)}>이전</button>
        <button on:click={goToToday}>오늘</button>
        <button on:click={() => navigate(1)}>다음</button>
      </div>
      <div class="calendar-title">
        {formatViewDate(currentDate)}
      </div>
      <div class="view-selector">
        {#each viewOptions as option}
          <button 
            class:active={currentView === option.id} 
            on:click={() => currentView = option.id}
          >
            {option.label}
          </button>
        {/each}
      </div>
    </div>
  
    <div class="calendar-body">
      {#if currentView === 'year'}
        <YearView 
          date={currentDate} 
          events={events} 
          on:dateClick={e => handleDateClick(e.detail)}
          on:eventClick={e => handleEventClick(e.detail)}
        />
      {:else if currentView === 'quarter'}
        <QuarterView 
          date={currentDate} 
          events={events} 
          on:dateClick={e => handleDateClick(e.detail)}
          on:eventClick={e => handleEventClick(e.detail)}
        />
      {:else if currentView === 'month'}
        <MonthView 
          date={currentDate} 
          events={events} 
          on:dateClick={e => handleDateClick(e.detail)}
          on:eventClick={e => handleEventClick(e.detail)}
        />
      {:else if currentView === 'week'}
        <WeekView 
          date={currentDate} 
          events={events} 
          on:dateClick={e => handleDateClick(e.detail)}
          on:eventClick={e => handleEventClick(e.detail)}
        />
      {:else if currentView === 'day'}
        <DayView 
          date={currentDate} 
          events={events} 
          on:dateClick={e => handleDateClick(e.detail)}
          on:eventClick={e => handleEventClick(e.detail)}
        />
      {:else if currentView === 'hour'}
        <HourView 
          date={currentDate} 
          events={events} 
          on:dateClick={e => handleDateClick(e.detail)}
          on:eventClick={e => handleEventClick(e.detail)}
        />
      {/if}
    </div>
  
    {#if showEventModal}
      <EventModal
        bind:event={eventData}
        on:close={() => showEventModal = false}
        on:save={saveEvent}
        on:delete={deleteEvent}
      />
    {/if}
  </div>
  
  <style>
    .calendar-container {
      background-color: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }
  
    .calendar-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      background-color: #f8f9fa;
      border-bottom: 1px solid #e9ecef;
    }
  
    .calendar-nav button {
      background: none;
      border: 1px solid #ced4da;
      border-radius: 4px;
      padding: 6px 12px;
      margin-right: 5px;
      cursor: pointer;
    }
  
    .calendar-nav button:hover {
      background-color: #e9ecef;
    }
  
    .calendar-title {
      font-size: 18px;
      font-weight: bold;
    }
  
    .view-selector button {
      background: none;
      border: none;
      padding: 6px 12px;
      cursor: pointer;
      border-radius: 4px;
    }
  
    .view-selector button:hover {
      background-color: #e9ecef;
    }
  
    .view-selector button.active {
      background-color: #007bff;
      color: white;
    }
  
    .calendar-body {
      padding: 16px;
    }
  </style>