import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, Inject, LOCALE_ID } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { CalendarService } from './calendar.service';

export interface IEvent {
    allDay: boolean;
    endTime: Date;
    startTime: Date;
    title: string;
}

export interface IRange {
    startTime: Date;
    endTime: Date;
}

export interface IView {
}

export interface IDayView extends IView {
    allDayEvents: IDisplayAllDayEvent[];
    rows: IDayViewRow[];
}

export interface IDayViewRow {
    events: IDisplayEvent[];
    time: Date;
}

export interface IMonthView extends IView {
    dates: IMonthViewRow[];
    dayHeaders: string[];
}

export interface IMonthViewRow {
    current?: boolean;
    date: Date;
    events: IEvent[];
    hasEvent?: boolean;
    label: string;
    secondary: boolean;
    selected?: boolean;
    disabled: boolean;
}

export interface IWeekView extends IView {
    dates: IWeekViewDateRow[];
    rows: IWeekViewRow[][];
    dayHeaders: string[];
}

export interface IWeekViewDateRow {
    date: Date;
    events: IDisplayEvent[];
}

export interface IWeekViewRow {
    events: IDisplayEvent[];
    time: Date;
}

export interface IDisplayEvent {
    endIndex: number;
    endOffset?: number;
    event: IEvent;
    startIndex: number;
    startOffset?: number;
    overlapNumber?: number;
    position?: number;
}

export interface IDisplayAllDayEvent {
    event: IEvent;
}

export interface ICalendarComponent {
    currentViewIndex: number;
    direction: number;
    eventSource: IEvent[];
    getRange: { (date:Date): IRange; };
    getViewData: { (date:Date): IView };
    mode: CalendarMode;
    range: IRange;
    views: IView[];
    onDataLoaded: { (): void };
    onRangeChanged: EventEmitter<IRange>;
}

export interface ITimeSelected {
    events: IEvent[];
    selectedTime: Date;
    disabled: boolean;
}

export interface IMonthViewDisplayEventTemplateContext {
    view: IView,
    row: number,
    col: number
}

export interface IMonthViewEventDetailTemplateContext {
    selectedDate: ITimeSelected,
    noEventsLabel: string
}

export interface IWeekViewAllDayEventSectionTemplateContext {
    day: IWeekViewDateRow,
    eventTemplate: TemplateRef<IDisplayAllDayEvent>
}

export interface IWeekViewNormalEventSectionTemplateContext {
    tm: IWeekViewRow,
    eventTemplate: TemplateRef<IDisplayEvent>
}

export interface IDayViewAllDayEventSectionTemplateContext {
    alldayEvents: IDisplayAllDayEvent[],
    eventTemplate: TemplateRef<IDisplayAllDayEvent>
}

export interface IDayViewNormalEventSectionTemplateContext {
    tm: IDayViewRow,
    eventTemplate: TemplateRef<IDisplayEvent>
}

export interface IDateFormatter {
    formatMonthViewDay?: { (date:Date): string; };
    formatMonthViewDayHeader?: { (date:Date): string; };
    formatMonthViewTitle?: { (date:Date): string; };
    formatWeekViewDayHeader?: { (date:Date): string; };
    formatWeekViewTitle?: { (date:Date): string; };
    formatWeekViewHourColumn?: { (date:Date): string; };
    formatDayViewTitle?: { (date:Date): string; };
    formatDayViewHourColumn?: { (date:Date): string; };
}

export type CalendarMode = 'day' | 'month' | 'week';

export type QueryMode = 'local' | 'remote';

export enum Step {
    QuarterHour = 15,
    HalfHour = 30,
    Hour = 60
}

@Component({
    selector: 'calendar',
    template: `<ng-template #monthviewDefaultDisplayEventTemplate let-view=\"view\" let-row=\"row\" let-col=\"col\">             {{view.dates[row*7+col].label}}         </ng-template>
    <ng-template #monthviewDefaultEventDetailTemplate let-showEventDetail=\"showEventDetail\" let-selectedDate=\"selectedDate\" let-noEventsLabel=\"noEventsLabel\">
        <ion-list class=\"event-detail-container\" has-bouncing=\"false\" *ngIf=\"showEventDetail\" overflow-scroll=\"false\">
            <div class=\"container\">
                <ion-item-group>

                    <ion-item *ngIf=\"selectedDate?.events.length>0\">
                        <ion-label><b>Cancelar</b></ion-label>
                        <ion-toggle mode=\"ios\" checked=\"false\"></ion-toggle>
                    </ion-item>

                    <ion-item no-lines *ngFor=\"let event of selectedDate?.events\">          
                        <ion-label text-wrap>
                            {{event.qdt}}x {{event.title}} 
                        </ion-label>  
                        <ion-note item-end>{{event.valor_item | currency: 'R$ '}}</ion-note>  
                    </ion-item>

                    <div class=\"section-div\" *ngIf=\"selectedDate?.events.length>0\">
                        <p class=\"section-title\">Endereço de Entrega</p>

                        <ion-item no-lines text-wrap>
                            <ion-label>
                            <h2>Casa</h2>
                            <p><b>Endereço:</b> rua dsdhskdsd, Batista campos, Belém - PA, Nº 23</p>
                            </ion-label>
                        </ion-item>
                    </div>

                    <ion-item *ngIf=\"selectedDate?.events.length==0\">
                        <div class=\"no-events-label\">{{noEventsLabel}}</div>
                    </ion-item>
                </ion-item-group>
            </div>
        </ion-list>
    </ng-template>
    <ng-template #defaultAllDayEventTemplate let-displayEvent=\"displayEvent\">
       <div class=\"calendar-event-inner\">{{displayEvent.event.title}}</div>
    </ng-template>
    <ng-template #defaultNormalEventTemplate let-displayEvent=\"displayEvent\">
       <div class=\"calendar-event-inner\">{{displayEvent.event.title}}</div>
    </ng-template>
    <div [ngSwitch]=\"calendarMode\" class=\"{{calendarMode}}view-container\">             <monthview *ngSwitchCase=\"'month'\"                 [formatDay]=\"formatDay\"                 [formatDayHeader]=\"formatDayHeader\"                 [formatMonthTitle]=\"formatMonthTitle\"                 [startingDayMonth]=\"startingDayMonth\"                 [showEventDetail]=\"showEventDetail\"                 [noEventsLabel]=\"noEventsLabel\"                 [autoSelect]=\"autoSelect\"                 [eventSource]=\"eventSource\"                 [markDisabled]=\"markDisabled\"                 [monthviewDisplayEventTemplate]=\"monthviewDisplayEventTemplate||monthviewDefaultDisplayEventTemplate\"                 [monthviewInactiveDisplayEventTemplate]=\"monthviewInactiveDisplayEventTemplate||monthviewDefaultDisplayEventTemplate\"                 [monthviewEventDetailTemplate]=\"monthviewEventDetailTemplate||monthviewDefaultEventDetailTemplate\"                 [locale]=\"locale\"                 [dateFormatter]=\"dateFormatter\"                 [dir]=\"dir\"                 [lockSwipeToPrev]=\"lockSwipeToPrev\"                 [lockSwipes]=\"lockSwipes\"                 [spaceBetween]=\"spaceBetween\"                        (onRangeChanged)=\"rangeChanged($event)\"                 (onEventSelected)=\"eventSelected($event)\"                 (onTimeSelected)=\"timeSelected($event)\"                 (onTitleChanged)=\"titleChanged($event)\">             </monthview>             <weekview *ngSwitchCase=\"'week'\"                 [formatWeekTitle]=\"formatWeekTitle\"                 [formatWeekViewDayHeader]=\"formatWeekViewDayHeader\"                 [formatHourColumn]=\"formatHourColumn\"                 [startingDayWeek]=\"startingDayWeek\"                 [allDayLabel]=\"allDayLabel\"                 [hourParts]=\"hourParts\"                 [eventSource]=\"eventSource\"                 [markDisabled]=\"markDisabled\"                 [weekviewAllDayEventTemplate]=\"weekviewAllDayEventTemplate||defaultAllDayEventTemplate\"                 [weekviewNormalEventTemplate]=\"weekviewNormalEventTemplate||defaultNormalEventTemplate\"                 [locale]=\"locale\"                 [dateFormatter]=\"dateFormatter\"                 [dir]=\"dir\"                 [scrollToHour]=\"scrollToHour\"                 [preserveScrollPosition]=\"preserveScrollPosition\"                 [lockSwipeToPrev]=\"lockSwipeToPrev\"                 [lockSwipes]=\"lockSwipes\"                 [startHour]=\"startHour\"                 [endHour]=\"endHour\"                 [spaceBetween]=\"spaceBetween\"                 (onRangeChanged)=\"rangeChanged($event)\"                 (onEventSelected)=\"eventSelected($event)\"                 (onTimeSelected)=\"timeSelected($event)\"                 (onTitleChanged)=\"titleChanged($event)\">             </weekview>             <dayview *ngSwitchCase=\"'day'\"                 [formatDayTitle]=\"formatDayTitle\"                 [formatHourColumn]=\"formatHourColumn\"                 [allDayLabel]=\"allDayLabel\"                 [hourParts]=\"hourParts\"                 [eventSource]=\"eventSource\"                 [markDisabled]=\"markDisabled\"                 [dayviewAllDayEventTemplate]=\"dayviewAllDayEventTemplate||defaultAllDayEventTemplate\"                 [dayviewNormalEventTemplate]=\"dayviewNormalEventTemplate||defaultNormalEventTemplate\"                 [locale]=\"locale\"                 [dateFormatter]=\"dateFormatter\"                 [dir]=\"dir\"                 [scrollToHour]=\"scrollToHour\"                 [preserveScrollPosition]=\"preserveScrollPosition\"                 [lockSwipeToPrev]=\"lockSwipeToPrev\"                 [lockSwipes]=\"lockSwipes\"                 [startHour]=\"startHour\"                 [endHour]=\"endHour\"                 [spaceBetween]=\"spaceBetween\"                 (onRangeChanged)=\"rangeChanged($event)\"                 (onEventSelected)=\"eventSelected($event)\"                 (onTimeSelected)=\"timeSelected($event)\"                 (onTitleChanged)=\"titleChanged($event)\">             </dayview>         </div>`,
    styles: [`:host > div { height: 100%; }        .event-detail-container {          border-top: 2px darkgrey solid;        }        .no-events-label {          font-weight: bold;          color: darkgrey;          text-align: center;        }        .event-detail {          cursor: pointer;          white-space: nowrap;          text-overflow: ellipsis;        }        .monthview-eventdetail-timecolumn {          width: 110px;          overflow: hidden;        }        .calendar-event-inner {          overflow: hidden;          background-color: #3a87ad;          color: white;          height: 100%;          width: 100%;          padding: 2px;          line-height: 15px;        }        @media (max-width: 750px) {          .calendar-event-inner {            font-size: 12px;          }        }
    .container ul {
        margin: 0;
        padding: 0px;
        list-style: none;
        position: relative;
        color: #fff;
        font-size: 13px;
        border: none!important;
    }
    .container ul:before {
        content: "";
        width: 1px;
        height: 100%;
        position: absolute;
        border-left: 2px dashed #000;
        margin-left: 36px;
    }
    .container ul li {
        position: relative;
        margin-left: 65px;
    }
    .container ul li:not(:first-child) {
        margin-top: 60px;
    }
    .container ul li > span {
        width: 2px;
        height: 100%;
        left: -30px;
        top: 0;
        position: absolute;
    }
    .container ul li > span:before, .container ul li > span:after {
        content: "";
        width: 8px;
        height: 8px;
        border-radius: 50%;
        border: 2px solid #000;
        position: absolute;
        background: #400440;
        left: -5px;
        top: 0;
    }
    .container ul li span:after {
        top: 100%;
    }
    .container ul li > div {
        margin-left: 10px;
    }
    .container div .title, .container div .type {
        font-weight: 600;
    }
    .container div .info {
        font-weight: 300;
    }
    .container div > div {
        margin-top: 5px;
    }
    .container span.number {
        height: 100%;
    }
    .container span.number span {
        position: absolute;
        font-size: 10px;
        left: -35px;
        font-weight: bold;
        color: #000;
    }
    .container span.number span:first-child {
        top: 0;
    }
    .container span.number span:last-child {
        top: 100%;     
    }
    .container ion-item .item-inner{
        border: none!important;
    }
    .item.item-block {
        background: transparent!important;
        border: none!important;
        padding: 0px!important;
        margin: 0px!important;
    }
    .item-inner {
        border: none!important;
        background: transparent!important;
        padding: 0px!important;
        margin: 0px!important;
    }
    .input-wrapper ion-label {
        border: none!important;
        padding: 0px!important;
        margin: 0px!important;
    }
    .input-wrapper {
        border: none!important;
        background: transparent!important;
        padding: 0px!important;
        margin: 0px!important;
    }`],
    providers: [CalendarService]
})
export class CalendarComponent implements OnInit {
    @Input()
    get currentDate():Date {
        return this._currentDate;
    }

    set currentDate(val:Date) {
        if (!val) {
            val = new Date();
        }

        this._currentDate = val;
        this.calendarService.setCurrentDate(val, true);
        this.onCurrentDateChanged.emit(this._currentDate);
    }

    @Input() eventSource:IEvent[] = [];
    @Input() calendarMode:CalendarMode = 'month';
    @Input() formatDay:string = 'd';
    @Input() formatDayHeader:string = 'EEE';
    @Input() formatDayTitle:string = 'MMMM dd, yyyy';
    @Input() formatWeekTitle:string = 'MMMM yyyy, Week $n';
    @Input() formatMonthTitle:string = 'MMMM yyyy';
    @Input() formatWeekViewDayHeader:string = 'EEE d';
    @Input() formatHourColumn:string = 'j';
    @Input() showEventDetail:boolean = true;
    @Input() startingDayMonth:number = 0;
    @Input() startingDayWeek:number = 0;
    @Input() allDayLabel:string = 'all day';
    @Input() noEventsLabel:string = 'No Events';
    @Input() queryMode:QueryMode = 'local';
    @Input() step:Step = Step.Hour;
    @Input() autoSelect:boolean = true;
    @Input() markDisabled:(date:Date) => boolean;
    @Input() monthviewDisplayEventTemplate:TemplateRef<IMonthViewDisplayEventTemplateContext>;
    @Input() monthviewInactiveDisplayEventTemplate:TemplateRef<IMonthViewDisplayEventTemplateContext>;
    @Input() monthviewEventDetailTemplate:TemplateRef<IMonthViewEventDetailTemplateContext>;
    @Input() weekviewAllDayEventTemplate:TemplateRef<IDisplayAllDayEvent>;
    @Input() weekviewNormalEventTemplate:TemplateRef<IDisplayEvent>;
    @Input() dayviewAllDayEventTemplate:TemplateRef<IDisplayAllDayEvent>;
    @Input() dayviewNormalEventTemplate:TemplateRef<IDisplayEvent>;
    @Input() weekviewAllDayEventSectionTemplate:TemplateRef<IWeekViewAllDayEventSectionTemplateContext>;
    @Input() weekviewNormalEventSectionTemplate:TemplateRef<IWeekViewNormalEventSectionTemplateContext>;
    @Input() dayviewAllDayEventSectionTemplate:TemplateRef<IDayViewAllDayEventSectionTemplateContext>;
    @Input() dayviewNormalEventSectionTemplate:TemplateRef<IDayViewNormalEventSectionTemplateContext>;
    @Input() dateFormatter:IDateFormatter;
    @Input() dir:string = "";
    @Input() scrollToHour:number = 0;
    @Input() preserveScrollPosition:boolean = false;
    @Input() lockSwipeToPrev:boolean = false;
    @Input() lockSwipes:boolean = false;
    @Input() locale:string = "";
    @Input() startHour:number = 0;
    @Input() endHour:number = 24;
    @Input() spaceBetween:number = 0;

    @Output() onCurrentDateChanged = new EventEmitter<Date>();
    @Output() onRangeChanged = new EventEmitter<IRange>();
    @Output() onEventSelected = new EventEmitter<IEvent>();
    @Output() onTimeSelected = new EventEmitter<ITimeSelected>();
    @Output() onTitleChanged = new EventEmitter<string>();

    private _currentDate:Date;
    private hourParts = 1;
    private currentDateChangedFromChildrenSubscription:Subscription;

    constructor(private calendarService:CalendarService, @Inject(LOCALE_ID) private appLocale:string) {
        this.locale = appLocale;
    }

    ngOnInit() {
        if (this.autoSelect) {
            if (this.autoSelect.toString() === 'false') {
                this.autoSelect = false;
            } else {
                this.autoSelect = true;
            }
        }
        this.hourParts = 60 / this.step;
        this.startHour = parseInt(this.startHour.toString());
        this.endHour = parseInt(this.endHour.toString());
        this.calendarService.queryMode = this.queryMode;

        this.currentDateChangedFromChildrenSubscription = this.calendarService.currentDateChangedFromChildren$.subscribe(currentDate => {
            this._currentDate = currentDate;
            this.onCurrentDateChanged.emit(currentDate);
        });
    }

    ngOnDestroy() {
        if (this.currentDateChangedFromChildrenSubscription) {
            this.currentDateChangedFromChildrenSubscription.unsubscribe();
            this.currentDateChangedFromChildrenSubscription = null;
        }
    }

    rangeChanged(range:IRange) {
        this.onRangeChanged.emit(range);
    }

    eventSelected(event:IEvent) {
        this.onEventSelected.emit(event);
    }

    timeSelected(timeSelected:ITimeSelected) {
        this.onTimeSelected.emit(timeSelected);
    }

    titleChanged(title:string) {
        this.onTitleChanged.emit(title);
    }

    loadEvents() {
        this.calendarService.loadEvents();
    }
}