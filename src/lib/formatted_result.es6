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
  'PARAM_INVALID': resultFormatter(101, 'Invalid parameter.'),
  'SUCC': resultFormatter(200, 'Successfully done.'),
  'DB_NOT_FOUND': resultFormatter(201, 'DB does not exist.'),
  'STORE_NOT_FOUND': resultFormatter(202, 'Store does not exist.'),
  'DB_OPEN_FAIL': resultFormatter(203, 'Open DB failed.'),
  'DB_ADD_ITEMS_FAIL': resultFormatter(204, 'Add items failed.'),
  'GET_ITEM_FAIL': resultFormatter(205, 'Get Item failed.'),
  'DB_DELETE_FAIL': resultFormatter(208, 'Delete DB failed.'),
  'ITEM_EXPIRED': resultFormatter(301, 'Item expired.'),
  'ITEM_NOT_FOUND': resultFormatter(302, 'Item does not exist.')
}
