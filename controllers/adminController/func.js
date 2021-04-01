const formatArray = (arr) => {
    let result = [];
    Array.from(arr).forEach(el => {
        let newObject = {
            serviceGroupName: el._doc.serviceGroupName,
            data: []
        }
        el._doc.service.data.forEach((item) => {
            let { data } = item // hope this will work :)
            if (typeof data == 'object' && data.hasOwnProperty('defaultName')) { // only include the object with defaultName property okok
                return newObject.data.push({ defaultName: data.defaultName, text: data.text })
            }
        })
        result.push(newObject)
    })
    return result;



}

const formatComponentArray = (arr) => {
    if (!Array.isArray(arr)) {
        return
    }

    let item = {
            name: '',
            image: '',
            location: '',
            type: '',
            category: ''
        }
        // let result = [];
    arr.forEach(({ _doc }) => {

        if (_doc.type == 'photo') {

            return item.image = _doc.data[0].url;
        }

        let { defaultName, text } = _doc.data

        if (defaultName == 'pageName') {
            return item.name = text;
        }

        if (['barangay', 'municipality', 'province'].includes(defaultName)) {
            item.location += text;
            if (defaultName != 'province') {
                item.location += ','
            }
            return item.location
        }

        if (defaultName == 'category') {
            return item.category = text
        }

        if (defaultName == 'type') {
            return item.type = text
        }
    });
    // console.log("page:", item);

    return item;

}

module.exports = { formatArray, formatComponentArray }