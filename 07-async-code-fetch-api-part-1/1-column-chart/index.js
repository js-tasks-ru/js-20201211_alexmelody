import fetchJson from './utils/fetch-json.js';

export default class ColumnChart {
    subElements = {};
    chartHeight = 50;

    constructor({
        url = '',
        range = {
            from: new Date(),
            to: new Date()
        },
        label = '',
        link = '',
        formatHeading = value => value,
    } = {}) {

        this.url = new URL('https://course-js.javascript.ru/' + url);
        this.label = label;
        this.link = link;
        this.formatHeading = formatHeading;

        this.render();
        this.update(range.from, range.to);
    }

    render() {
        const element = document.createElement('div');

        element.innerHTML = this.getChartTemplate();

        this.element = element.firstElementChild;

        this.subElements = this.getChildElements(this.element);
    }

    getChildElements(element) {
        const elements = element.querySelectorAll('[data-element]');

        return [...elements].reduce((resultObj, subElement) => {
            resultObj[subElement.dataset.element] = subElement;

            return resultObj;
        }, {});
    }

    getChartTemplate() {
        return `
      <div class="column-chart column-chart_loading" style="--chart-height: ${this.chartHeight}">
        <div class="column-chart__title">
          Total ${this.label}
          ${this.getChartLink()}
        </div>
        <div class="column-chart__container">
          <div data-element="header" class="column-chart__header">
            
          </div>
          <div data-element="body" class="column-chart__chart">
            
          </div>
        </div>
      </div>      
      `;
    }

    getChartLink() {
        return (this.link) ? `<a href="${this.link}" class="column-chart__link">View all</a>` : '';
    }

    getChartColumn(data = []) {
        const maxValue = Math.max(...data);
        return data
            .map(value => {
                const scale = value / maxValue;
                return `<div style="--value: ${Math.floor(this.chartHeight * scale)}" data-tooltip="${(scale * 100).toFixed(0)}%"></div>`;
            })
            .join('');
    }

    async update(from, to) {
        try {
            this.element.classList.add('column-chart_loading');

            this.url.searchParams.set('from', from.toISOString());
            this.url.searchParams.set('to', to.toISOString());          

            const data = await fetchJson(this.url);
            this.updateData(Object.values(data));
        } catch (error) {
        }
    }

    updateData(newData = []) {
        if (newData.length) {
            this.element.classList.remove('column-chart_loading');
        }

        this.subElements.header.innerHTML = this.formatHeading([...newData].reduce((sum, value) => sum + value, 0));
        this.subElements.body.innerHTML = this.getChartColumn(newData);
    }

    remove() {
        this.element.remove();
    }

    destroy() {
        this.remove();
    }
}
