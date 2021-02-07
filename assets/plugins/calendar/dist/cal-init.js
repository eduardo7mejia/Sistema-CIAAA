
!function($) {
    "use strict";

    var CalendarApp = function() {
        this.$body = $("body")
        this.$calendar = $('#calendar'),
        this.$event = ('#calendar-events div.calendar-events'),
        this.$categoryForm = $('#add-new-event form'),
        this.$extEvents = $('#calendar-events'),
        this.$modal = $('#my-event'),
        this.$saveCategoryBtn = $('.save-category'),
        this.$calendarObj = null
    };


    /* on drop */
    CalendarApp.prototype.onDrop = function (eventObj, date) {
        var $this = this;
            // retrieve the dropped element's stored Event Object
            var originalEventObject = eventObj.data('eventObject');
            var $categoryClass = eventObj.attr('data-class');
            // we need to copy it, so that multiple events don't have a reference to the same object
            var copiedEventObject = $.extend({}, originalEventObject);
            // assign it the date that was reported
            copiedEventObject.start = date;
            if ($categoryClass)
                copiedEventObject['className'] = [$categoryClass];
            // render the event on the calendar
            $this.$calendar.fullCalendar('renderEvent', copiedEventObject, true);
            // is the "remove after drop" checkbox checked?
            if ($('#drop-remove').is(':checked')) {
                // if so, remove the element from the "Draggable Events" list
                eventObj.remove();
            }
    },
    /* on click on event */
    CalendarApp.prototype.onEventClick =  function (calEvent, jsEvent, view) {
            var $this = this;
            var form = $("<form></form>");
            form.append("<label>Cambiar nombre del evento</label>");
            form.append("<div class='input-group'><input class='form-control' type=text value='" + calEvent.title + "' /><span class='input-group-btn'><button type='submit' class='btn btn-success waves-effect waves-light'><i class='fa fa-check'></i> Guardar</button></span></div>");
            $this.$modal.modal({
                backdrop: 'static'
            });
            $this.$modal.find('.delete-event').show().end().find('.save-event').hide().end().find('.modal-body').empty().prepend(form).end().find('.delete-event').unbind('click').click(function () {
                $this.$calendarObj.fullCalendar('removeEvents', function (ev) {
                  var eventDelete = {
                      'id': calEvent.id
                  };

                  $.ajax({
                       type: 'POST',
                       url: 'deleteAgenda',
                       data: eventDelete,
                       success: function(resp){
                         if(resp.estado==='exitoDelete'){
                           return (ev._id == calEvent._id);
                           $this.$modal.modal('hide');
                         }
                       }
                   });
                });
                //$this.$modal.modal('hide');
            });
            $this.$modal.find('form').on('submit', function () {

                calEvent.title = form.find("input[type=text]").val();
                var eventUpdate = {
                    'motivo': calEvent.title,
                    'id': calEvent.id
                };
                $.ajax({
                     type: 'POST',
                     url: 'updateAgenda',
                     data: eventUpdate,
                     success: function(resp){
                       if(resp.estado==='exitoUpdate'){
                         $this.$modal.modal('hide');
                       }
                     }
                 });
                $this.$calendarObj.fullCalendar('updateEvent', calEvent);
                //$this.$modal.modal('hide');
                return false;
            });
    },
    /* on select */
    CalendarApp.prototype.onSelect = function (start, end, allDay) {
        var $this = this;
            $this.$modal.modal({
                backdrop: 'static'
            });
            var form = $("<form></form>");
            form.append("<div class='row'></div>");
            form.find(".row")
                .append("<div class='col-md-6'><div class='form-group'><label class='control-label'>Nombre actividad</label><input class='form-control' placeholder='Nombre actividad' type='text' name='title'/></div></div>")
                .append("<div class='col-md-6'><div class='form-group'><label class='control-label'>Categoria</label><select class='form-control' name='category'></select></div></div>")
                .find("select[name='category']")
                .append("<option value='bg-danger'>Cancelado</option>");
            $this.$modal.find('.delete-event').hide().end().find('.save-event').show().end().find('.modal-body').empty().prepend(form).end().find('.save-event').unbind('click').click(function () {
                form.submit();
            });
            $this.$modal.find('form').on('submit', function () {
                var title = form.find("input[name='title']").val();
                var beginning = form.find("input[name='beginning']").val();
                var ending = form.find("input[name='ending']").val();
                var categoryClass = form.find("select[name='category'] option:checked").val();
                var id;
                start.local();
                end.local();
                if (title !== null && title.length != 0) {
                  var eventInsert = {
                      'fecha_inicio': $.fullCalendar.formatDate(start, "YYYY-MM-DD HH:mm:ss"),
                      'fecha_final': $.fullCalendar.formatDate(end, "YYYY-MM-DD HH:mm:ss"),
                      'motivo': title,
                      'tipo': categoryClass
                  };
                  $.ajax({
                       type: 'POST',
                       url: 'insertAgenda',
                       data: eventInsert,
                       success: function(resp){
                         if(resp.estado==='exito'){
                           id=resp.id;
                           $this.$modal.modal('hide');
                         }
                       }
                   });
                    $this.$calendarObj.fullCalendar('renderEvent', {
                        id:id,
                        constraint:id,
                        title: title,
                        start: start,
                        end: end,
                        allDay: false,
                        className: categoryClass
                    }, true);
                }
                else{
                    alert('Tienes que agregar nombre a la actividad');
                }
                return false;

            });
            $this.$calendarObj.fullCalendar('unselect');
    },
    CalendarApp.prototype.enableDrag = function() {
        //init events
        $(this.$event).each(function () {
            // create an Event Object (http://arshaw.com/fullcalendar/docs/event_data/Event_Object/)
            // it doesn't need to have a start or end
            var eventObject = {
                title: $.trim($(this).text()) // use the element's text as the event title
            };
            // store the Event Object in the DOM element so we can get to it later
            $(this).data('eventObject', eventObject);
            // make the event draggable using jQuery UI
            $(this).draggable({
                zIndex: 999,
                revert: true,      // will cause the event to go back to its
                revertDuration: 0  //  original position after the drag
            });
        });
    }
    /* Initializing */
    CalendarApp.prototype.init = function() {
        this.enableDrag();
        /*  Initialize the calendar  */
        var date = new Date();
        var d = date.getDate();
        var m = date.getMonth();
        var y = date.getFullYear();
        var form = '';
        var today = new Date($.now());

        var defaultEvents =  [/*{
                title: 'Released Ample Admin!',
                start: new Date($.now() + 506800000),
                className: 'bg-info'
            }*/];

        var $this = this;
        $this.$calendarObj = $this.$calendar.fullCalendar({
            locale: 'es',
            slotDuration: '00:15:00', /* If we want to split day time each 15minutes */
            minTime: '09:00:00',
            maxTime: '20:00:00',
            defaultView: 'agendaWeek',
            handleWindowResize: true,
            header: {
                left: 'prev,next today',
                center: 'title',
                right: 'month,agendaWeek,agendaDay'
            },
            events:function (start, end, timezone, callback) {
                    $.ajax({
                        url: 'getdays',
                        type: "GET",
                        datatype: 'json',
                        success: function (data) {
                            var events = [];
                            if ($(data) != undefined && $(data).length > 0) {
                                $(data).each(function (index, cita ) {
                                  events.push({
                                        id:cita.idcita,
                                        title: cita.motivo,
                                        start: new Date(cita.fecha_inicio),
                                        end: new Date(cita.fecha_final),
                                        className: cita.tipo
                                    });

                                });
                            }
                            callback(events);
                        },
                        error: function (err) {
                            alert('Error recuperando información');
                            console.log(err);
                        }
                    });
                },
            editable: true,
            droppable: true, // this allows things to be dropped onto the calendar !!!
            eventLimit: true, // allow "more" link when too many events
            selectable: true,
            drop: function(date) { $this.onDrop($(this), date); },
            select: function (start, end, allDay) { $this.onSelect(start, end, allDay); },
            eventClick: function(calEvent, jsEvent, view) { $this.onEventClick(calEvent, jsEvent, view); },
            timezone: 'America/Mexico_City'

        });

        //on new event
        this.$saveCategoryBtn.on('click', function(){
            var categoryName = $this.$categoryForm.find("input[name='category-name']").val();
            var categoryColor = $this.$categoryForm.find("select[name='category-color']").val();
            if (categoryName !== null && categoryName.length != 0) {
                $this.$extEvents.append('<div class="calendar-events" data-class="bg-' + categoryColor + '" style="position: relative;"><i class="fa fa-circle text-' + categoryColor + '"></i>' + categoryName + '</div>')
                $this.enableDrag();
            }

        });
    },

   //init CalendarApp
    $.CalendarApp = new CalendarApp, $.CalendarApp.Constructor = CalendarApp

}(window.jQuery),

//initializing CalendarApp
function($) {
    "use strict";
    $.CalendarApp.init()
}(window.jQuery);
