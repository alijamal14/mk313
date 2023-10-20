// js/components/UrlItemComponent.js

Vue.component('url-item', {
    template: '#url-item-template',
    props: ['item'],
    methods: {
        copyURL(url) {
            const el = document.createElement('textarea');
            el.value = url;
            document.body.appendChild(el);
            el.select();
            document.execCommand('copy');
            document.body.removeChild(el);
            alert('URL copied to clipboard!');
        }
    }
});
