function parseCsv(csvData) {
    let lines = csvData.split('\n')
    let data = [];

    let titles = lines[0].split(',')

    // checks if there is any data availabe!
    if (lines.length === 0 || titles.length === 0) {
        console.error('No values found');
        return;
    }

    for (let i = 2; i < lines.length; i++) {
        const [dateStr, windStr] = lines[i].split(',');

        // NOTE: 'moment.js' is a library for date
        // parse date
        let date = moment(dateStr);

        // parse wind speed
        let windSpd = Number.parseFloat(windStr);

        // if date or wind speed is invalid, skip the loop
        if (!date || isNaN(windSpd)) {
            continue;
        }
        //data frame to access columns via the title 
        data.push({
            [titles[0]]: date,
            [titles[1]]: windSpd
        });
    }
    return data;
}

/**
 * Parse dataset to be shown by months and the average wind_spd of that month
 * @param dataset dataset with properties {time: Moment, wind_spd_avg: number}
 */
function formatDataset(dataset, attrName) {
    return dataset
        .GroupBy(d => d.time.format('MM/YYYY'))
        .Distinct() // for enforcing unique values
        .Select(grp => {
            const spd_sum = grp
                .Where(d => Number.isNaN(d['surface_temp_avg']) == false)
                .Sum(d => d['surface_temp_avg']);
            const valueCount = grp.Select(grp => grp.time).Count();
            
            // console.log(`Speed Sum: ${spd_sum}, Count: ${valueCount}, Value: ${spd_sum / valueCount}`);
            
            return {
                month: grp.Key,
                values: spd_sum / valueCount
                // values: grp.Sum(d => d.wind_spd_avg) / grp.Select(grp => grp.time).Count()
            }
            // }
        })
        .ToArray();
}