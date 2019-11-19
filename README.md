# 🎒 idb-managed
Easy IndexedDB API, using DB manager to manage local database. Based on [idb](https://github.com/jakearchibald/idb).

## Why do you need it?
IndexedDB APIs are cumbersome that almost every db operation is related to an opening of the database. Even though you just want to get some data from a single database, you have to fill so many params and care about so many transactions.

The idb-managed can save these troubles. 

If you want to get something from a database, you only need to provide the name of the database, the table and the item index, that's all. The idb-managed will do the rest for you.

## Getting Started
Install logan-web using `npm`:

```
npm install --save idb-managed
```

Or `yarn`:

```
yarn add idb-managed
```

## Environment Required
idb-managed needs to run in a browser environment with native Promise implemented. You will need a Promise polyfill like es6-promise if your application needs to run in an older browser.

## A Simple Demo

```js
import { getItemFromDB } from 'idb-managed';
const DBName = 'DEMO_DB';
const tableName = 'STUDENTS'
let studentId = 1234;

let studentInfo = await getItemFromDB(DBName, tableName, studentId);
console.log(sylviaInfo);
/* e.g.
{ name: "sylvia", studentId: 1234, age: 18, country: "China" }
*/
```
Very easy, right?😁


## API
### 📚 idbIsSupported
idb-managed is based on IndexedDB. This method helps to tell you whether current environment supports IndexedDB. Using other methods in idb-managed will throw an error if this method returns false.

```js
import { idbIsSupported } from 'idb-managed';

console.log('IndexedDB is supported: ' + idbIsSupported());
```


### 📚 CustomDB(dbConfig)

You can define a CustomDB with specific database and table structures first, and then perform the db operations without complicated process. Here is the demo code:

```js
import { CustomDB } from 'idb-managed';

/* Define db and table structures first. */
let db = new CustomDB({
	dbName: 'DEMO_DB',
	dbVersion: 1,
	itemDuration: 5000 * 3600,
	tables: {
		STUDENTS: {
			primaryKey: 'studentId',
			indexList: [
				{
					indexName: 'name',
					unique: false
				},
				{
					indexName: 'age',
					unique: false
				}
			],
			itemDuration: 1000 * 3600
		},
		OTHER_INFO: {}
	}
});
```
* dbConfig: Metadata of the database.
	* dbName: Name of the database.
	* dbVersion(Optional): Version of the database. Default to be 1.
	* itemDuration(Optional): The duration time of items of all tables in this database. itemDuration in the table overides this.
	* tables: tables of the database. Name of the table is the key.
		* primaryKey(Optional): Name of the primary index, your item in this table must contain this property if defined.
		* indexList(Optional): Indexes of this table. Index is used for IndexedDB to retrieve data quickly. You can get data within a centain range if the index is defined.
			* indexName: Name of the index.
			* unique: Whether value of this indexed property is unique. Adding two items with same value of this property will not success if this index is unique.
		* itemDuration(Optional): The duration of items in this table. Expired items will be deleted during next add operation of this table. itemDuration in  the itemConfig overides this.

#### 🏷 addItems(itemConfig[])

```js
import { CustomDB } from 'idb-managed';
let db = new CustomDB({
/* ... */
});

await db.addItems([
	{
    	tableName: 'STUDENTS',
    	item: {
    		name: 'sylvia',
    		studentId: '1234',
    		age: 18,
    		country: 'China'
    	},
		itemDuration: 500 * 3600
    },
    {
    	tableName: 'OTHER_INFO',
    	item: {
    		userId: '9876',
    		// ...
    	}
    }
])

```
addItems transaction is atomic, which means this transaction will roll back if any item failed to be added.

* itemConfig: The item's info.
	* tableName: Name of the table you want to add the item into.
	* item: The item you want to add.
	* itemDuration(Optional): The duration of this item. Expired items will be deleted during next add operation of this table.

#### 🏷 getItem(tableName, primaryKeyValue)

```js
import { CustomDB } from 'idb-managed';
let db = new CustomDB({
/* ... */
});

let studentInfo = await db.getItem('STUDENTS', 1234);

```

* tableName: Name of the table.
* primaryKeyValue: Value of the primary index you want.

#### 🏷 getItemsInRange(tableIndexRange)

```js
import { CustomDB } from 'idb-managed';
let db = new CustomDB({
/* ... */
});

/* Get students who are younger than 20 (age < 20). */
let studentInfos = await db.getItemsInRange({
	tableName: 'STUDENTS',
	indexRange: {
		indexName: 'age',
		upperIndex: 20,
		upperExclusive: true
	}
});

```

* indexRange(Optional): Range of the index. All items will be retrieved if indexRange is not defined.
	* indexName: Name of this index.
	* onlyIndex: Value of the index. Retrieve the items which index value equals to this value.
	* upperIndex: Upper value of the range. Retrieve the items which index value is less than ( or equal to if upperExclusive is false ) this value.
	* lowerIndex: Lower value of the range. Retrieve the items which index value is greater than ( or equal to if lowerExclusive is false ) this value.
	* upperExclusive: Default to be false.
	* lowerExclusive: Default to be false.


#### 🏷 deleteItemsInRange(tableIndexRange)

```js
import { CustomDB } from 'idb-managed';
let db = new CustomDB({
/* ... */
});

/* Delete all the items in table STUDENTS */
await db.deleteItemsInRange({
	tableName: 'STUDENTS'
})
```

### 📚 getItemFromDB(dbName, tableName, primaryKeyValue)
`A Simple Demo` has already shown you how to use this method. You don't need to define a DB first! This method will not cause openDB failed when you want to open the DB with different table structure next time.

### 📚 getItemsInRangeFromDB(dbName, tableIndexRange)
Similar to getItemsInRange of CustomDB. Also, you don't have to define a DB before using this method.

```js
import { getItemsInRangeFromDB } from 'idb-managed';

let studentInfos = await getItemsInRangeFromDB('DEMO_DB', {
	tableName: 'STUDENTS',
	indexRange: {
		indexName: 'age',
		onlyIndex: 18
	}
});

```

### 📚 deleteDB(dbName)
Delete the whole database.

```js
import { deleteDB } from 'idb-managed';

await deleteDB('DEMO_DB');

```

## License
Contributions to idb-managed will be licensed under [MIT license](https://github.com/sylvia1106/idb-managed/blob/master/LICENSE).

