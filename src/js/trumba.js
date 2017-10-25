var methods = {
  
      datetime: function( startDate, endDate, format ) {

          var date = [ moment(startDate), moment(endDate) ],
              today = moment(),
              period = function( date ) {

                var result = date, 
                    regex = /([^A-Za-z0-9])/g,
                    months = ['Jan', 'Feb', 'Mar', 'Apr', 'Jun', 'Jul', 'Oct', 'Nov', 'Dec'],
                    days = ['Su','Sun', 'Mo','Mon', 'Tu','Tue', 'We','Wed', 'Th','Thu', 'Fr','Fri'];

                if( format.period ) {

                  if( format.period.day === true ) {

                    result = result.split(regex).map(function(value){
                      return days.indexOf(value) > -1 ? value + '.' : value;
                    }).join('');

                  }

                  if( format.period.month === true ) {

                    result = result.split(regex).map(function(value){
                      return months.indexOf(value) > -1 ? value + '.' : value;
                    }).join('');

                  }

                }

                return result;

              };

          if( format.use == 'end' ) {

            return period( date[1].format(format.format) );

          }

          else if( format.use == 'start' ) {

            return period( date[0].format(format.format) );

          }                              

          else if( format.through !== false && date[0].isBefore(today) && date[1].isAfter(today) ) {

            if( date[1].hour() === 0 && date[1].minute() === 0 ) date[1].subtract(1, 'minute');

            return period( date[1].format(format.through) );

          }

          else if( date[1].diff(date[0], 'days') === 0 ){

            return date.map(function(d, i){
              return period( d.format(format.time[i]) );
            }).join(' - ');

          }

          else if( date[1].diff(date[0], 'days') >= 1 ){

            return date.map(function(d, i){
              return period( d.format(format.day[i]) );
            }).join(' - ');

          }

          else {

            return date.map(function(d, i){
              return period( d.format(format.format) );
            }).join(' - ');

          }

        },

      truncate: function( text, cap, x ) {

          var self = this;

          if( cap && cap <= text.length ) {

            var array = text.match(/(<.+?>)|(&.+?;)|(\S|\s)/g);

            var count = 0, string = '', index = 0;

            while( count < cap ) {

              var value = array[index];

              string += value;

              if( !(/<(?!br).+?>/).test(value) ) count++;

              index++;

            }

            self.truncated = true;

            return string + (x || '...');

          }

          self.truncated = false;

          return text;

        },

      limit: function( array, limit ) {

        if( limit ) return array.slice(0, limit);

        return array;

      },

      location: function(){

        return location.href;

      }

    },
    filters = {
    
      feedID: function( url ) {
      
      return url.substring(url.lastIndexOf('/') + 1, url.indexOf('.json'));
      
    },
      
      date: function( date, format ) {
      
      if( !format ) return date;
      
      return moment(date).format(format);
      
    }
    
    },
    queryString = function(){
      
      var query = {};
    
      location.search.slice(1).split('&').filter(function(value){

        return value != '' && value !== undefined && value !== null;

      }).forEach(function(string){

        var array = string.split('=');

        if( array.length > 0 ) query[array[0]] = $.isNumeric(array[1]) ? +array[1] : array[1];

      });
      
      return query;
      
    };

Vue.component('trumba-feed', {
  
  template: '#trumba-feed',
  
  props: ['count', 'feed', 'calendar', 'cap', 'date'],
  
  data: function(){
    return {
      items: []
    };
  },
  
  methods: {
    
    limit: methods.limit
    
  },
  
  filters: {
    
    feedID: filters.feedID
    
  },
  
  created: function() {
    
    var self = this;
    
    $.get('php/proxy.php?url=' + this.feed).done(function(data){

      self.items = JSON.parse(data);
      
    });
    
  }
  
});

Vue.component('trumba-item', {
  
  template: '#trumba-item',
  
  props: ['item', 'calendar', 'cap', 'date', 'feed'],
  
  data: function(){
    return {
      item: {}
    };
  },
  
  filters: {
    
    date: filters.date
    
  },
  
  methods: {
    
    datetime: methods.datetime,
    
    truncate: methods.truncate
    
  }
  
});

Vue.component('trumba-detail', {
  
  template: '#trumba-detail',
  
  props: ['date'],
  
  data: function(){
    return {
      feed: null,
      calendar: null,
      selected: null,
      id: null,
      item: {}
    };
  },
  
  methods: {
    
    datetime: methods.datetime,
    
    location: methods.location,
    
    metadata: function(){
      
      [
        $('<meta>', { 
          property: 'og:url', 
          content: this.location() 
        }),
        $('<meta>', { 
          property: 'og:type', 
          content: 'article' 
        }),
        $('<meta>', { 
          property: 'og:title', 
          content: this.item.title 
        }),
        $('<meta>', { 
          property: 'og:description', 
          content: this.item.description 
        }),
        $('<meta>', { 
          property: 'og:image', 
          content: this.item.eventImage ? this.item.eventImage.url : null
        })
      ].forEach(function(meta){
        
        $(document.head).append( meta );
        
      });
      
    },
    
    facebook: function(){
      
      var self = this;
      
      $.getScript('//connect.facebook.net/en_US/sdk.js').then(function(){
        
        FB.init({
          appId: 1190151744464763,
          xfbml: true,
          version: 'v2.10'
        });
        
        FB.ui({
          method: 'share',
          display: 'popup',
          href: self.location()
        }, function(response){});
        
      });
      
    },
    
    twitter: function(){
      
      var self = this;
      
      $.getScript('//platform.twitter.com/widgets.js').then(function(){
        
        window.open('//twitter.com/intent/tweet?text=' + 
          self.item.title + ': ' + 
          self.datetime(self.item.startDateTime, self.item.endDateTime, self.date) +
          '&url=' +
          self.location(), '_blank', 'width=540,height=280');
        
      });
      
    },

    action: function(){
                 
      window.open(this.selected, '_blank', 'width=550, height=700');
      
    }
    
  },
  
  filters: {
    
    feedID: filters.feedID
    
  },
  
  created: function() {
    
    var self = $.extend(true, this, queryString());
    
    $.get('php/proxy.php?url=' + self.feed).done(function(data){
     
      self.item = JSON.parse(data).filter(function(item){
    
        return item.eventID == self.id;
        
      })[0]; 
      
      self.metadata();
      
    });
    
  }
  
});

Vue.component('trumba-calendar', {
  
  template: '#trumba-calendar',
  
  props: ['format'],
  
  data: function(){
    return {
      items: []
    };
  },
  
  methods: {
    
    byMonth: function(list) {
      
      var groupName = function( date ) {
            return date.format('MMMM') + ' ' + date.year();
          },
          firstOfMonth = function( date ) {
            return moment(date).startOf('month');
          },
          lastOfMonth = function( date ) {
            return moment(date).endOf('month');
          },
          addResult = function( item, date ) {
            
            var exists = result.filter(function(lookup){
              return lookup.name == groupName( date );
            });
            
            if( exists.length > 0 ) {
              
              exists[0].items.push( item );

            }

            else {

              result.push({
                name: groupName( date ),
                date: firstOfMonth( date ),
                items: [ item ]
              });

            }
            
          },
          result = [];
      
      list.forEach(function(item){
        
        var start = moment(item.startDateTime),
            end = moment(item.endDateTime);
       
        addResult( item, end );
        
      });
      
      result.sort(function(a, b){
        
        if( a.date.isBefore(b.date) ) return -1;
        if( a.date.isAfter(b.date) ) return 1;
        return 0;
        
      });
      
      return result;
      
    },
    
    byDuration: function(list) {
      
      var now = moment(),
          firstOfMonth = function( date ) {
            return moment(date).startOf('month');
          },
          lastOfMonth = function( date ) {
            return moment(date).endOf('month');
          },
          groupName = function( date ) {
            return date.format('MMMM') + ' ' + date.year();
          },
          addResult = function( item, date ) {
            
            var exists = result.filter(function(lookup){
              return lookup.name == groupName( date );
            });
            
            if( exists.length > 0 ) {
              
              exists[0].items.push( item );

            }

            else {

              result.push({
                name: groupName( date ),
                first: firstOfMonth( date ),
                last: lastOfMonth( date ),
                items: [ item ]
              });

            }
            
          },
          result = [
            {
              name: groupName( now ),
              first: firstOfMonth( now ),
              last: lastOfMonth( now ),
              items: []
            }
          ];
      
      list.forEach(function(item){
        
        var start = moment(item.startDateTime),
            end = moment(item.endDateTime),
            comp = moment(now);
        
        while( end >= firstOfMonth(comp) ) {
          
          addResult(item, comp);
          
          comp.add(1, 'month');
          
        }
        
      });
      
      result.sort(function(a, b){
        
        if( a.first.isBefore(b.first) ) return -1;
        if( a.first.isAfter(b.first) ) return 1;
        return 0;
        
      });
      
      return result;
      
    },
    
    datetime: methods.datetime
    
  },
  
  filters: {
    
    date: filters.date
    
  },
  
  created: function(){
    
    var self = $.extend(true, this, queryString());
    
    $.get('php/proxy.php?url=' + self.feed).done(function(data){
     
      self.items = JSON.parse(data);
      
    });
    
  }
  
});

Vue.component('trumba-schedule', {
  
  template: '#trumba-schedule',
  
  props: ['date'],
  
  data: function(){
    return {
      items: []
    };
  },
  
  created: function(){
    
    var self = $.extend(true, this, queryString());
    
    $.get('php/proxy.php?url=' + self.feed).done(function(data){
     
      self.items = JSON.parse(data);
      
    });
    
  }
  
});

[].forEach.call(document.querySelectorAll('.trumba'), function(trumba){
  
  new Vue({ el: trumba });
  
});