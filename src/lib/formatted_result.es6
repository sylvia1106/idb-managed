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
  'OPEN_DB_FAIL': resultFormatter(203, 'Open DB failed.'),
  'ADD_ITEM_FAIL': resultFormatter(204, 'Add item failed.'),
  'GET_ITEM_FAIL': resultFormatter(205, 'Get item failed.'),
  'GET_ITEMS_IN_RANGE_FAIL': resultFormatter(206, 'Get items in range failed.'),
  'DELETE_DB_FAIL': resultFormatter(208, 'Delete DB failed.'),
  'ITEM_EXPIRED': resultFormatter(301, 'Item expired.'),
  'ITEM_NOT_FOUND': resultFormatter(302, 'Item does not exist.')
}
