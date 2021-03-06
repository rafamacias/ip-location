
class SourcesApi {
    constructor () {
        this.index = 0;
        this.sources = [
            {
                name: 'freegeoip',
                url: '//freegeoip.net/json/',
                country: 'country_name',
                timezone: 'time_zone'
            },
            {
                name: 'telize',
                url: '//www.telize.com/geoip'
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
};

module.exports = SourcesApi;
