const formatArray = (arr) => {

    let result = [];
    Array.from(arr).forEach(el => {
        let newObject = {
            serviceGroupName: el._doc.serviceGroupName,
            data: []
        }
        let _data = el._doc.service.data
        if (Array.isArray(_data)) {
            _data.forEach((item) => {
                let { data } = item // hope this will work :)
                if (typeof data == 'object' && data.hasOwnProperty('defaultName')) { // only include the object with defaultName property okok
                    //    if(data.defaultName === "quantity")
                    return newObject.data.push({ defaultName: data.defaultName, text: data.text })

                }
            })
            result.push(newObject)
        }
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
    return item;
}


const formatPendingArray = (arr) => {

    let result = [];

    // arr.arr._doc.data = arr._doc.data.shift();
    if (Array.isArray(arr)) {
        arr.map(el => {
            let newObject = {
                data: []
            }
            let { data } = el;
            if (Array.isArray(data)) {
                data.forEach(item => {
                    if (item.data.defaultName) {
                        newObject['serviceGroupName'] = item.data.text;
                    } else {
                        item.data.map(_item => {
                            if (typeof _item.data == 'object' && _item.data.hasOwnProperty('defaultName')) {
                                // only include the object with defaultName property 
                                newObject.data.push({ defaultName: _item.data.defaultName, text: _item.data.text })
                            }
                        })
                    }
                })
                result.push(newObject)

                //     data.shift();
                //     data.forEach(element => {
                //         // try daw
                //         element.data.map(el => {
                //               
                //             })
                //             // console.log({ element: element.data[0].data });
                //             // if (typeof element == 'object' && element.hasOwnProperty('defaultName')) { // only include the object with defaultName property 
                //             //     newObject.data.push({ defaultName: element.defaultName, text: element.text })
                //             // }
                //     });
                // }
                // 
            }

        })
    }
    return result;

}
module.exports = { formatArray, formatComponentArray, formatPendingArray }