// js/components/UrlItemComponent.js

Vue.component('url-item', {
    props: ['item'],
    template: `
        <li class="list-group-item">
            <div class="d-flex justify-content-between align-items-center mb-2">
                <h4>{{ item.name }}</h4>
                <a :href="item.url" class="btn btn-primary btn-sm">Visit</a>
            </div>
            <div class="input-group">
                <input v-model="item.url" type="text" class="form-control" readonly>
                <div class="input-group-append">
                    <button @click="copyURL(item.url)" class="btn btn-outline-secondary">
                        <i class="fas fa-copy"></i>
                    </button>
                </div>
            </div>
        </li>
    `,
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
