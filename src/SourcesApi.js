export class SourcesApi {
    constructor () {
        this.index = 0;
        this.sources = [
            {
                name: 'freegeoip',
                url: '//freegeoip.net/json/',
                country: 'country_name',
                timezone: 'time_zone',
                ajaxOptions : {
                    isJsonp : true,
                    callbackName : 'callback'
                }
            },
            {
                name: 'telize',
                url: '//www.telize.com/geoip',
                ajaxOptions : {
                    isJsonp : false
                }
            }
        ];
    };

    addSource(sources) {
      //it is an array. Maybe check for typeof?
      if(sources.length) {
                for (let i = sources.length - 1; i >= 0; i--) {
                    this.sources.unshift(sources[i]);
                };
            //it is a simple source
            } else {
        this.sources.unshift(sources);
            }
    };

    getNext() {
        return this.sources[this.index++];
    };

    reset() {
        this.index = 0;
    }
}