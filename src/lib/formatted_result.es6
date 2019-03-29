/**
 * @file unified formatted result for idb-managed
 */

function resultFormatter(code, msg) {
  let formattedResult = {
    code,
    msg,
    data: {}
  }
  formattedResult.setData = (supplyment) => {
    formattedResult.data = Object.assign({}, formattedResult.data, supplyment)
    return formattedResult
  }
  return formattedResult
}
export default {
  'DB_NOT_SUPPORT': resultFormatter(100, 'IndexedDB is not supported.'),
  'DB_OPEN_FAIL': resultFormatter(203, 'Open DB failed.'),
  'SUCC': resultFormatter(200, 'Successfully done.'),
  'DB_NOT_FOUND': resultFormatter(301, 'DB does not exist.'),
  'STORE_NOT_FOUND': resultFormatter(302, 'Store does not exist.'),
  'ITEM_EXPIRED': resultFormatter(403, 'Item expired.'),
  'ITEM_NOT_FOUND': resultFormatter(404, 'Item does not exist.'),
  'GET_ITEM_FAIL': resultFormatter(405, 'Get Item failed.')
}
