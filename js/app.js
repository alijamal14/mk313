// js/app.js

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
