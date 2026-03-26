const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.match(/\.(tsx|ts)$/)) {
            results.push(file);
        }
    });
    return results;
}

const files = walk('c:\\Users\\ADMIN\\DAL\\src');
let changedCount = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let orig = content;
    
    // Replace schema properties
    content = content.replace(/\borigin\b/g, 'start_location');
    content = content.replace(/\bvehicle_type\b/g, 'vehicle_type_used');
    content = content.replace(/\bprice_estimated\b/g, 'fare_price_range_min');
    content = content.replace(/\bfare_min\b/g, 'fare_price_range_min');
    content = content.replace(/\bfare_max\b/g, 'fare_price_range_max');
    content = content.replace(/\bduration_minutes\b/g, 'estimated_travel_time_min');
    content = content.replace(/\bitinerary\b/g, 'stops_along_the_way');
    
    // Restore specific false positives
    content = content.replace(/window\.location\.start_location/g, 'window.location.origin');
    
    // In types or generic generic constraints, `origin` might have been fine, but it's safe to be start_location
    
    if (content !== orig) {
        fs.writeFileSync(file, content, 'utf8');
        changedCount++;
        console.log("Updated: " + file);
    }
});

console.log("Done. Updated " + changedCount + " files.");
