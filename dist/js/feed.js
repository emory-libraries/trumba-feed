Vue.component('trumba-feed', {
  
  template: '#trumba-feed',
  
  props: ['count', 'feed', 'calendar', 'cap', 'date'],
  
  data: function(){
    return {
      items: []
    };
  },
  
  methods: {
    
    limit: function( array, limit ) {
      
      if( limit ) return array.slice(0, limit);
      
      return array;
      
    }
    
  },
  
  filters: {
    
    feedID: function( url ) {
      
      return url.substring(url.lastIndexOf('/') + 1, url.indexOf('.json'));
      
    }
    
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
  
  props: ['item', 'calendar', 'cap', 'date'],
  
  data: function(){
    return {
      item: {}
    };
  },
  
  filters: {
    
    date: function( date, format ) {
      
      if( !format ) return date;
      
      return moment(date).format(format);
      
    }
    
  },
  
  methods: {
    
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
                                                       
      else if( date[0].isBefore(today) && date[1].isAfter(today) ) {
        
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
      
    }
    
  }
  
});

[].forEach.call(document.querySelectorAll('.trumba'), function(trumba){
  
  new Vue({ el: trumba });
  
});