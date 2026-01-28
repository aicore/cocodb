/*global describe, it, before, after, beforeEach, afterEach*/
import * as chai from 'chai';
import {
    cleanUp,
    CONFIGS,
    DATABASE_NAME, initTest,
    isServerStarted,
    TABLE_NAME
} from "./setupIntegTest.js";
import {
    init, close as wsClose, hello, put, get, createDb, deleteDb,
    createTable, deleteTable, createIndex, getFromIndex, getFromNonIndex,
    deleteDocument, deleteDocuments, update, mathAdd, query,
    listDatabases, listTables, getTableIndexes
} from "@aicore/cocodb-ws-client";

let expect = chai.expect;


describe('Integration: ws end points', function () {
    before(async function () {
        //setNumberOfTestFiles(1);
        await initTest();
        await isServerStarted();

        console.log('starting integ tests');
        init(`ws://localhost:${CONFIGS.port}`, CONFIGS.authKey);
        const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
        await delay(1000);
        await createDb(DATABASE_NAME);

    });
    after(async function () {
        await deleteDb(DATABASE_NAME);
        await wsClose();
        cleanUp();

    });
    beforeEach(async function () {
        await createTable(TABLE_NAME);
    });
    afterEach(async function () {
        await deleteTable(TABLE_NAME);
    });
    it('test hello', async function () {
        const response = await hello();
        expect(response.hello).eql('world');
    });
    it('createDb and deleteDb should be successful', async function () {
        const createDbResp = await createDb('hello');
        expect(createDbResp.isSuccess).eql(true);
        const deleteDbResp = await deleteDb('hello');
        expect(deleteDbResp.isSuccess).eql(true);

    });
    it('createDb should fail to create same db twice', async function () {
        let createDbResp = await createDb('hello');
        expect(createDbResp.isSuccess).eql(true);

        createDbResp = await createDb('hello');

        expect(createDbResp.isSuccess).eql(false);
        expect(createDbResp.errorMessage).eql("Error: Can't create database 'hello'; database exists");

        const deleteDbResp = await deleteDb('hello');
        expect(deleteDbResp.isSuccess).eql(true);


    });
    it('deletedb should fail to create same db twice', async function () {
        let createDbResp = await deleteDb('hello');
        expect(createDbResp.isSuccess).eql(false);
        expect(createDbResp.errorMessage).eql("Error: Can't drop database 'hello'; database doesn't exist");


    });
    it('delete Table should pass', async function () {
        const tableName = `${DATABASE_NAME}.abc`;
        const createTableResp = await createTable(tableName);
        expect(createTableResp.isSuccess).eql(true);
        const deleteTableResp = await deleteTable(tableName);
        expect(deleteTableResp.isSuccess).eql(true);


    });
    it('put and get and delete to table should pass', async function () {
        const document = {
            'lastName': 'Alice',
            'Age': 100,
            'active': true,
            'location': {
                'city': 'Banglore',
                'state': 'Karnataka',
                'layout': {
                    'block': '1stblock'
                }

            }
        };
        const putResp = await put(TABLE_NAME, document);
        expect(putResp.isSuccess).eql(true);
        expect(putResp.documentId.length).gt(10);
        const getResp = await get(TABLE_NAME, putResp.documentId);
        expect(getResp.isSuccess).eql(true);
        expect(getResp.document.lastName).eql('Alice');
        expect(getResp.document.Age).eql(100);
        expect(getResp.document.location.city).eql('Banglore');
        expect(getResp.document.location.state).eql('Karnataka');
        expect(getResp.document.location.layout.block).eql('1stblock');
        const delResp = await deleteDocument(TABLE_NAME, putResp.documentId);
        expect(delResp.isSuccess).eql(true);

    });
    it('delete document with condition should work as expected', async function () {
        const document = {
            'lastName': 'Alice',
            'Age': 100,
            'active': true,
            'location': {
                'city': 'Banglore',
                'state': 'Karnataka',
                'layout': {
                    'block': '1stblock'
                }

            }
        };
        const putResp = await put(TABLE_NAME, document);
        expect(putResp.isSuccess).eql(true);

        // now do a delete whose condition would fail
        let delResp = await deleteDocument(TABLE_NAME, putResp.documentId, "$.Age = 200");
        expect(delResp.isSuccess).eql(true);
        // the document should be there still
        let getResp = await get(TABLE_NAME, putResp.documentId);
        expect(getResp.isSuccess).eql(true);
        expect(getResp.document.lastName).eql('Alice');
        expect(getResp.document.Age).eql(100);

        // now delete with satisfying condition
        delResp = await deleteDocument(TABLE_NAME, putResp.documentId, "$.Age = 100");
        expect(delResp.isSuccess).eql(true);
        // the document should be there still
        getResp = await get(TABLE_NAME, putResp.documentId);
        expect(getResp.isSuccess).eql(false);
    });

    // deleteDocuments test
    async function _populateDB() {
        const document = {
            'lastName': 'Alice',
            Age: 1,
            'active': true,
            'location': {
                'city': 'Banglore',
                'state': 'Karnataka',
                'layout': {
                    'block': '1stblock'
                }

            }
        };
        let putPromises = [];
        for(let i=0; i<100; i++){
            document.Age = i;
            putPromises.push(put(TABLE_NAME, document));
        }
        await Promise.all(putPromises);
    }

    it('delete document without index should work as expected', async function () {
        await _populateDB();

        // verify write
        let queryResp = await query(TABLE_NAME, "$.Age >10 and $.Age <25");
        expect(queryResp.isSuccess).eql(true);
        expect(queryResp.documents.length).eql(14);

        // now delete
        let delResp = await deleteDocuments(TABLE_NAME, "$.Age >10 and $.Age <25");
        expect(delResp.isSuccess).eql(true);
        expect(delResp.deleteCount).eql(14);

        // verify delete
        queryResp = await query(TABLE_NAME, "$.Age >10 and $.Age <25");
        expect(queryResp.isSuccess).eql(true);
        expect(queryResp.documents.length).eql(0);
        queryResp = await query(TABLE_NAME, "$.Age =10");
        expect(queryResp.isSuccess).eql(true);
        expect(queryResp.documents.length).eql(1);
        queryResp = await query(TABLE_NAME, "$.Age =25");
        expect(queryResp.isSuccess).eql(true);
        expect(queryResp.documents.length).eql(1);
    });

    it('delete document with index should work as expected', async function () {
        await createIndex(TABLE_NAME, 'Age', 'INT');
        await _populateDB();

        // verify write
        let queryResp = await query(TABLE_NAME, "$.Age >10 and $.Age <25", ['Age']);
        expect(queryResp.isSuccess).eql(true);
        expect(queryResp.documents.length).eql(14);

        // now delete
        let delResp = await deleteDocuments(TABLE_NAME, "$.Age >10 and $.Age <25", ['Age']);
        expect(delResp.isSuccess).eql(true);
        expect(delResp.deleteCount).eql(14);

        // verify delete
        queryResp = await query(TABLE_NAME, "$.Age >10 and $.Age <25", ['Age']);
        expect(queryResp.isSuccess).eql(true);
        expect(queryResp.documents.length).eql(0);
        queryResp = await query(TABLE_NAME, "$.Age =10", ['Age']);
        expect(queryResp.isSuccess).eql(true);
        expect(queryResp.documents.length).eql(1);
        queryResp = await query(TABLE_NAME, "$.Age =25", ['Age']);
        expect(queryResp.isSuccess).eql(true);
        expect(queryResp.documents.length).eql(1);
    });

    it('createIndex should pass', async function () {
        const document = {
            id: '12345',
            'lastName': 'Alice',
            'Age': 100,
            'active': true,
            'location': {
                'city': 'Banglore',
                'state': 'Karnataka',
                'layout': {
                    'block': '1stblock'
                }

            }
        };
        const putResp = await put(TABLE_NAME, document);
        expect(putResp.isSuccess).eql(true);
        expect(putResp.documentId.length).gt(10);
        const createIndexResp = await createIndex(TABLE_NAME, 'Age', 'INT');

        expect(createIndexResp.isSuccess).eql(true);

        const getFromIndexResp = await getFromIndex(TABLE_NAME, {
            'Age': 100
        });
        expect(getFromIndexResp.isSuccess).eql(true);
        expect(getFromIndexResp.documents[0].id).eql('12345');
        expect(getFromIndexResp.documents[0].lastName).eql('Alice');
        expect(getFromIndexResp.documents[0].Age).eql(100);
        expect(getFromIndexResp.documents[0].location.city).eql('Banglore');
        expect(getFromIndexResp.documents[0].location.state).eql('Karnataka');
        expect(getFromIndexResp.documents[0].location.layout.block).eql('1stblock');

        const getFromIndexEmptyResp = await getFromIndex(TABLE_NAME, {
            'Age': 101
        });
        expect(getFromIndexEmptyResp.documents.length).eql(0);
        expect(getFromIndexEmptyResp.isSuccess).eql(true);
    });
    it('create unique index test', async function () {
        const document = {
            id: '12345',
            'lastName': 'Alice',
            'Age': 100,
            'active': true,
            'location': {
                'city': 'Banglore',
                'state': 'Karnataka',
                'layout': {
                    'block': '1stblock'
                }

            }
        };
        const putResp = await put(TABLE_NAME, document);
        expect(putResp.isSuccess).eql(true);
        const docId = putResp.documentId;
        expect(docId.length).gt(10);
        const createIndexResp = await createIndex(TABLE_NAME, 'id', 'VARCHAR(50)', true, true);
        expect(createIndexResp.isSuccess).eql(true);
        const newPutResp = await put(TABLE_NAME, document);
        expect(newPutResp.isSuccess).eql(false);
        expect(newPutResp.errorMessage).eql("Error: Duplicate entry '12345' for key 'customers.col_b80bb7740288fda1f201890375a60c8f'");
    });
    it('getFromNonIndex test should pass', async function () {
        const document = {
            id: '12345',
            'lastName': 'Alice',
            'Age': 100,
            'active': true,
            'location': {
                'city': 'Banglore',
                'state': 'Karnataka',
                'layout': {
                    'block': '1stblock'
                }

            }
        };
        await put(TABLE_NAME, document);
        await put(TABLE_NAME, document);
        const scanResults = await getFromNonIndex(TABLE_NAME, {
            location: {
                layout: {
                    block: '1stblock'
                }
            }
        });
        expect(scanResults.isSuccess).eql(true);
        expect(scanResults.documents.length).eql(2);
        expect(scanResults.documents[0].id).eql('12345');
        expect(scanResults.documents[0].lastName).eql('Alice');
        expect(scanResults.documents[0].Age).eql(100);
        expect(scanResults.documents[0].location.city).eql('Banglore');
        expect(scanResults.documents[0].location.state).eql('Karnataka');
        expect(scanResults.documents[0].location.layout.block).eql('1stblock');
        expect(scanResults.documents[1].id).eql('12345');
        expect(scanResults.documents[1].lastName).eql('Alice');
        expect(scanResults.documents[1].Age).eql(100);
        expect(scanResults.documents[1].location.city).eql('Banglore');
        expect(scanResults.documents[1].location.state).eql('Karnataka');
        expect(scanResults.documents[1].location.layout.block).eql('1stblock');

        const emptyResults = await getFromNonIndex(TABLE_NAME, {
            location: {
                layout: {
                    block: '2ndblock'
                }
            }
        });
        expect(emptyResults.isSuccess).eql(true);
        expect(emptyResults.documents.length).eql(0);
        const emptyObjectQueryResults = await getFromNonIndex(TABLE_NAME);
        expect(emptyObjectQueryResults.isSuccess).eql(true);
        expect(emptyObjectQueryResults.documents.length).eql(2);
    });

    it('getFromNonIndex test should paginate and pass', async function () {
        const document = {
            id: '12345',
            'lastName': 'Alice',
            'Age': 100,
            'active': true,
            'location': {
                'city': 'Banglore',
                'state': 'Karnataka',
                'layout': {
                    'block': '1stblock'
                }

            }
        };
        let putPromises = [];
        for (let i=0; i<100; i++){
            document.counter = i;
            putPromises.push(put(TABLE_NAME, document));
        }
        await Promise.all(putPromises);
        let scanResults = await getFromNonIndex(TABLE_NAME, {
            location: {
                layout: {
                    block: '1stblock'
                }
            }
        }, {
            pageOffset: 0,
            pageLimit: 10
        });
        expect(scanResults.isSuccess).eql(true);
        expect(scanResults.documents.length).eql(10);
        let lastDocCounter = scanResults.documents[9].counter;
        expect(scanResults.documents[9].counter).not.eql(scanResults.documents[8].counter);

        scanResults = await getFromNonIndex(TABLE_NAME, {
            location: {
                layout: {
                    block: '1stblock'
                }
            }
        }, {
            pageOffset: 9,
            pageLimit: 10
        });

        expect(scanResults.isSuccess).eql(true);
        expect(scanResults.documents.length).eql(10);
        expect(lastDocCounter).eql(scanResults.documents[0].counter);
    });

    it('update document should pass', async function () {
        const document = {
            id: '12345',
            'lastName': 'Alice',
            'Age': 100,
            'active': true,
            'location': {
                'city': 'Banglore',
                'state': 'Karnataka',
                'layout': {
                    'block': '1stblock'
                }

            }
        };
        const putResp = await put(TABLE_NAME, document);
        document.lastName = 'bob';
        const updateResponse = await update(TABLE_NAME, putResp.documentId, document);
        expect(updateResponse.isSuccess).eql(true);
        const getResponse = await get(TABLE_NAME, putResp.documentId);
        expect(getResponse.isSuccess).eql(true);
        expect(getResponse.document.lastName).eql('bob');
        expect(getResponse.document.Age).eql(100);
        expect(getResponse.document.location.city).eql('Banglore');
        expect(getResponse.document.location.state).eql('Karnataka');
        expect(getResponse.document.location.layout.block).eql('1stblock');

    });
    it('conditional update document should pass', async function () {
        const document = {
            'name': 'Alice',
            'Age': 100
        };
        const putResp = await put(TABLE_NAME, document);
        document.name = "BOB";
        document.Age = 23;

        // conditional update with fail condition
        let updateResponse = await update(TABLE_NAME, putResp.documentId, document, `$.name='Alice' AND $.Age=50`);
        expect(updateResponse.isSuccess).to.be.false;
        let getResponse = await get(TABLE_NAME, putResp.documentId);
        expect(getResponse.isSuccess).eql(true);
        expect(getResponse.document.name).eql('Alice');
        expect(getResponse.document.Age).eql(100);

        // conditional update with passing condition
        updateResponse = await update(TABLE_NAME, putResp.documentId, document, `$.name='Alice' AND $.Age=100`);
        expect(updateResponse.isSuccess).to.be.true;
        getResponse = await get(TABLE_NAME, putResp.documentId);
        expect(getResponse.isSuccess).eql(true);
        expect(getResponse.document.name).eql('BOB');
        expect(getResponse.document.Age).eql(23);

    });
    it('make 1500 writes followed by read and delete', async function () {
        await writeAndReadFromDb(1500);
    });
    it('should be able to increment json field', async function () {
        const putResp = await put(TABLE_NAME, {age: 10, total: 100});
        const docId = putResp.documentId;
        let incStatus = await mathAdd(TABLE_NAME, docId, {
            age: 2,
            total: 100
        });
        expect(incStatus.isSuccess).eql(true);
        let getResponse = await get(TABLE_NAME, docId);
        let modifiedDoc = getResponse.document;
        expect(modifiedDoc.age).eql(12);
        expect(modifiedDoc.total).eql(200);
        incStatus = await mathAdd(TABLE_NAME, docId, {
            age: 1
        });
        expect(incStatus.isSuccess).eql(true);
        getResponse = await get(TABLE_NAME, docId);
        modifiedDoc = getResponse.document;
        expect(modifiedDoc.age).eql(13);
        expect(modifiedDoc.total).eql(200);
        incStatus = await mathAdd(TABLE_NAME, docId, {
            age: -2,
            total: -300,
            abc: 10
        });
        expect(incStatus.isSuccess).eql(true);
        getResponse = await get(TABLE_NAME, docId);
        modifiedDoc = getResponse.document;
        expect(modifiedDoc.age).eql(11);
        expect(modifiedDoc.total).eql(-100);
        expect(modifiedDoc.abc).eql(10);

        incStatus = await mathAdd(TABLE_NAME, '1', {
            age: -2,
            total: -300,
            abc: 10
        });
        expect(incStatus.isSuccess).eql(false);
        expect(incStatus.errorMessage).eql('unable to find documentId');
    });
    it('should be able to conditionally increment json field', async function () {
        // First, create a document to work with
        const putResp = await put(TABLE_NAME, {count: 5, score: 100, active: 1});
        const docId = putResp.documentId;

        // Test case 1: Condition satisfied (count > 3)
        let incStatus = await mathAdd(TABLE_NAME, docId, {
            count: 1,
            score: 50
        }, "$.count > 3");
        expect(incStatus.isSuccess).eql(true);

        // Verify the increment worked
        let getResponse = await get(TABLE_NAME, docId);
        let modifiedDoc = getResponse.document;
        expect(modifiedDoc.count).eql(6);
        expect(modifiedDoc.score).eql(150);

        // Test case 2: Condition not satisfied (count > 10)
        incStatus = await mathAdd(TABLE_NAME, docId, {
            count: 5,
            score: 200
        }, "$.count > 10");

        // Expect failure since the condition is not met
        expect(incStatus.isSuccess).eql(false);
        expect(incStatus.errorMessage).to.include('Not updated - condition failed');

        // Verify values are unchanged
        getResponse = await get(TABLE_NAME, docId);
        modifiedDoc = getResponse.document;
        expect(modifiedDoc.count).eql(6);  // Still 6, not 11
        expect(modifiedDoc.score).eql(150); // Still 150, not 350

        // Test case 3: Multiple conditions (count < 10 AND score > 100)
        incStatus = await mathAdd(TABLE_NAME, docId, {
            count: 2,
            score: -50
        }, "$.count < 10 AND $.score > 100");
        expect(incStatus.isSuccess).eql(true);

        // Verify values are updated according to all conditions being met
        getResponse = await get(TABLE_NAME, docId);
        modifiedDoc = getResponse.document;
        expect(modifiedDoc.count).eql(8);
        expect(modifiedDoc.score).eql(100);

        // Test case 4: Invalid condition syntax
        incStatus = await mathAdd(TABLE_NAME, docId, {
            count: 1
        }, "$.count invalid syntax");

        expect(incStatus.isSuccess).eql(false);
        // Error message will depend on your implementation's error handling
        expect(incStatus.errorMessage).to.exist;

        // Test case 5: Condition with nonexistent field (should evaluate as null and not match)
        incStatus = await mathAdd(TABLE_NAME, docId, {
            count: 1
        }, "$.nonexistent > 0");

        expect(incStatus.isSuccess).eql(false);
        expect(incStatus.errorMessage).to.include('Not updated - condition failed');
    });
    it('integ tests for query', async function () {
        const putResp = await put(TABLE_NAME, {age: 10, total: 100});
        expect(putResp.isSuccess).eql(true);
        const queryResp = await query(TABLE_NAME, '$.age = 10 and $.total = 100');
        expect(queryResp.isSuccess).eql(true);
        expect(queryResp.documents.length).eql(1);
        expect(queryResp.documents[0].age).eql(10);
        expect(queryResp.documents[0].total).eql(100);
        const emptyResp = await query(TABLE_NAME, '$.Age = 10 and $.total = 100');
        expect(emptyResp.isSuccess).eql(true);
        expect(emptyResp.documents.length).eql(0);

    });
    it('query on index should pass', async function () {
        const document = {
            id: '12345',
            'lastName': 'Alice',
            'Age': 100,
            'active': true,
            'location': {
                'city': 'Bangalore',
                'state': 'Karnataka',
                'layout': {
                    'block': '1stblock'
                }

            }
        };
        const putResp = await put(TABLE_NAME, document);
        expect(putResp.isSuccess).eql(true);
        expect(putResp.documentId.length).gt(10);
        const createIndexResp = await createIndex(TABLE_NAME, 'Age', 'INT');
        expect(createIndexResp.isSuccess).eql(true);
        const queryResp = await query(TABLE_NAME, "$.Age = 100 and $.location.city ='Bangalore'", ['Age']);
        expect(queryResp.isSuccess).eql(true);
        expect(queryResp.documents.length).eql(1);
        expect(queryResp.documents[0].id).eql('12345');
        expect(queryResp.documents[0].Age).eql(100);
        expect(queryResp.documents[0].active).eql(true);
        expect(queryResp.documents[0].location.city).eql('Bangalore');
        expect(queryResp.documents[0].location.state).eql('Karnataka');
        expect(queryResp.documents[0].location.layout.block).eql('1stblock');

    });

    it('query on index should paginate and pass', async function () {
        const document = {
            id: '12345',
            'lastName': 'Alice',
            'Age': 100,
            'active': true,
            'location': {
                'city': 'Bangalore',
                'state': 'Karnataka',
                'layout': {
                    'block': '1stblock'
                }

            }
        };
        let putPromises = [];
        for (let i=0; i<100; i++){
            document.counter = i;
            putPromises.push(put(TABLE_NAME, document));
        }
        await Promise.all(putPromises);
        const createIndexResp = await createIndex(TABLE_NAME, 'counter', 'INT');
        expect(createIndexResp.isSuccess).eql(true);

        let queryResp = await query(TABLE_NAME, "$.counter > 10", ['counter'], {
            pageOffset: 0,
            pageLimit: 10
        });
        expect(queryResp.isSuccess).eql(true);
        expect(queryResp.documents.length).eql(10);
        let lastDocCounter = queryResp.documents[9].counter;
        expect(queryResp.documents[9].counter).not.eql(queryResp.documents[8].counter);

        queryResp = await query(TABLE_NAME, "$.counter > 10", ['counter'], {
            pageOffset: 9,
            pageLimit: 10
        });
        expect(queryResp.isSuccess).eql(true);
        expect(queryResp.documents.length).eql(10);
        expect(lastDocCounter).eql(queryResp.documents[0].counter);

    });

    // ============================================
    // listDatabases Tests
    // ============================================

    it('listDatabases should return list of databases including test database', async function () {
        const response = await listDatabases();
        expect(response.isSuccess).eql(true);
        expect(response.databases).to.be.an('array');
        expect(response.databases.length).to.be.greaterThan(0);
        expect(response.databases).to.include(DATABASE_NAME);
    });

    it('listDatabases should include newly created database', async function () {
        const newDbName = 'test_list_db_' + Date.now();
        await createDb(newDbName);

        const response = await listDatabases();
        expect(response.isSuccess).eql(true);
        expect(response.databases).to.include(newDbName);

        // Cleanup
        await deleteDb(newDbName);
    });

    it('listDatabases should not include deleted database', async function () {
        const tempDbName = 'temp_db_' + Date.now();
        await createDb(tempDbName);
        await deleteDb(tempDbName);

        const response = await listDatabases();
        expect(response.isSuccess).eql(true);
        expect(response.databases).to.not.include(tempDbName);
    });

    // ============================================
    // listTables Tests
    // ============================================

    it('listTables should return tables in database', async function () {
        const response = await listTables(DATABASE_NAME);
        expect(response.isSuccess).eql(true);
        expect(response.tables).to.be.an('array');
    });

    it('listTables should include the test table', async function () {
        const response = await listTables(DATABASE_NAME);
        expect(response.isSuccess).eql(true);
        // TABLE_NAME is in format "database.table", extract table part
        const tableName = TABLE_NAME.split('.')[1];
        expect(response.tables).to.include(tableName);
    });

    it('listTables should include newly created table', async function () {
        const newTableName = DATABASE_NAME + '.new_test_table_' + Date.now();
        await createTable(newTableName);

        const response = await listTables(DATABASE_NAME);
        expect(response.isSuccess).eql(true);
        expect(response.tables).to.include(newTableName.split('.')[1]);

        // Cleanup
        await deleteTable(newTableName);
    });

    it('listTables should not include deleted table', async function () {
        const tempTableName = DATABASE_NAME + '.temp_table_' + Date.now();
        await createTable(tempTableName);
        await deleteTable(tempTableName);

        const response = await listTables(DATABASE_NAME);
        expect(response.isSuccess).eql(true);
        expect(response.tables).to.not.include(tempTableName.split('.')[1]);
    });

    it('listTables should return empty array for database with no tables', async function () {
        const emptyDbName = 'empty_db_' + Date.now();
        await createDb(emptyDbName);

        const response = await listTables(emptyDbName);
        expect(response.isSuccess).eql(true);
        expect(response.tables).to.be.an('array');
        expect(response.tables.length).eql(0);

        // Cleanup
        await deleteDb(emptyDbName);
    });

    it('listTables should fail for non-existent database', async function () {
        const response = await listTables('nonexistent_database_xyz_12345');
        expect(response.isSuccess).eql(false);
        expect(response.errorMessage).to.exist;
    });

    // ============================================
    // getTableIndexes Tests
    // ============================================

    it('getTableIndexes should return PRIMARY index for table', async function () {
        const response = await getTableIndexes(TABLE_NAME);
        expect(response.isSuccess).eql(true);
        expect(response.indexes).to.be.an('array');
        expect(response.indexes.length).to.be.greaterThan(0);

        // Every cocodb table has a PRIMARY index on documentID
        const primaryIndex = response.indexes.find(idx => idx.isPrimary === true);
        expect(primaryIndex).to.exist;
        expect(primaryIndex.indexName).eql('PRIMARY');
        expect(primaryIndex.columnName).eql('documentID');
    });

    it('getTableIndexes should include custom created index', async function () {
        // Create a custom index
        await createIndex(TABLE_NAME, 'customerName', 'VARCHAR(255)', false, false);

        const response = await getTableIndexes(TABLE_NAME);
        expect(response.isSuccess).eql(true);

        // Find the custom index by jsonField (stored WITHOUT $. prefix)
        const customIndex = response.indexes.find(idx => idx.jsonField === 'customerName');
        expect(customIndex).to.exist;
    });

    it('getTableIndexes should show unique index properties', async function () {
        // Create a unique index
        await createIndex(TABLE_NAME, 'email', 'VARCHAR(255)', true, false);

        const response = await getTableIndexes(TABLE_NAME);
        expect(response.isSuccess).eql(true);

        // Find the unique index by jsonField (stored WITHOUT $. prefix)
        const uniqueIndex = response.indexes.find(idx => idx.jsonField === 'email');
        expect(uniqueIndex).to.exist;
        expect(uniqueIndex.isUnique).eql(true);
    });

    it('getTableIndexes should return correct index structure', async function () {
        const response = await getTableIndexes(TABLE_NAME);
        expect(response.isSuccess).eql(true);

        // Verify index object structure
        const index = response.indexes[0];
        expect(index).to.have.property('indexName');
        expect(index).to.have.property('columnName');
        expect(index).to.have.property('isUnique');
        expect(index).to.have.property('isPrimary');
        expect(index).to.have.property('sequenceInIndex');
        expect(index).to.have.property('indexType');
        expect(index).to.have.property('isNullable');
    });

    it('getTableIndexes should fail for non-existent table', async function () {
        const response = await getTableIndexes(DATABASE_NAME + '.nonexistent_table_xyz');
        expect(response.isSuccess).eql(false);
        expect(response.errorMessage).to.exist;
    });

    it('getTableIndexes should fail for invalid table name format', async function () {
        const response = await getTableIndexes('invalid_table_name_without_dot');
        expect(response.isSuccess).eql(false);
        expect(response.errorMessage).to.exist;
    });

});

async function writeAndReadFromDb(numberOfTimes) {
    const document = {
        id: '12345',
        'lastName': 'Alice',
        'Age': 100,
        'active': true,
        'location': {
            'city': 'Banglore',
            'state': 'Karnataka',
            'layout': {
                'block': '1stblock'
            }

        }
    };
    const putPromises = [];
    for (let i = 0; i < numberOfTimes; i++) {
        let putResp = put(TABLE_NAME, document);
        putPromises.push(putResp);
    }
    const putResults = await Promise.all(putPromises);
    putResults.forEach(result => {
        expect(result.isSuccess).eql(true);
    });
    const getPromises = [];
    for (const resp of putResults) {
        let getResponse = get(TABLE_NAME, resp.documentId);
        getPromises.push(getResponse);
    }
    const results = await Promise.all(getPromises);
    expect(results.length).eql(numberOfTimes);
    results.forEach(result => {
        expect(result.isSuccess).eql(true);
        expect(result.document.lastName).eql('Alice');
        expect(result.document.Age).eql(100);
        expect(result.document.location.city).eql('Banglore');
        expect(result.document.location.state).eql('Karnataka');
        expect(result.document.location.layout.block).eql('1stblock');
    });

    const queryResp = await query(TABLE_NAME, "$.lastName = 'Alice'");
    expect(queryResp.isSuccess).eql(true);
    expect(queryResp.documents.length).eql(numberOfTimes <= 1000 ? numberOfTimes : 1000);
    for (const result of queryResp.documents) {
        expect(result.lastName).eql('Alice');
        expect(result.Age).eql(100);
        expect(result.location.city).eql('Banglore');
        expect(result.location.state).eql('Karnataka');
        expect(result.location.layout.block).eql('1stblock');
    }

    const deletePromises = [];
    putResults.forEach(result => {
        let promise = deleteDocument(TABLE_NAME, result.documentId);
        deletePromises.push(promise);

    });

    const deleteResults = await Promise.all(deletePromises);

    deleteResults.forEach(result => {
        expect(result.isSuccess).eql(true);
    });
}
