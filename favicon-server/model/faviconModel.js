const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const faviconSchema = new Schema({
    url: String,
    fav_url: String,
    created_at: {type: Date, default: Date.now()}
})

const faviconModel = mongoose.model('Favicon', faviconSchema);

module.exports = faviconModel;