import UrlItem from './components/url-item.js?mk313V1';

Vue.component('url-item', UrlItem);

new Vue({
    el: '#app',
    data: {
        urls: [
            { url: "http://cemicuat.mk313.com/", name: "UAT APP" },
            { url: "http://cemicuatapi.mk313.com/", name: "UAT API" },
            { url: "http://cemicqa.mk313.com/", name: "QA APP" },
            { url: "http://cemicqaapi.mk313.com/", name: "QA API" }
        ]
    }
});
