import Handlebars, { HelperOptions } from 'handlebars';

function kvdata(optionsData: any, key: String, value: String) {
  const data = Handlebars.createFrame(optionsData);
  data.value = value;
  data.key = key;
  return data;
}

export function eachSorted(items: any, options: HelperOptions) {
  const itemsAsHtml = Object.keys(items)
    .sort()
    .map(item => options.fn(item, { data: kvdata(options.data, item, items[item]) }));
  return itemsAsHtml.join('\n');
}
