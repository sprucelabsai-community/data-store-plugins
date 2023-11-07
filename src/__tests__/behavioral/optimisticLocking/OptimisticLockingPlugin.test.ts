import { Database } from '@sprucelabs/data-stores'
import { AbstractSpruceFixtureTest } from '@sprucelabs/spruce-test-fixtures'
import { test, assert, errorAssert, generateId } from '@sprucelabs/test-utils'
import OptimisticLockingPlugin from '../../../optimisticLocking/OptimisticLockingPlugin'
import SpyStore1 from '../../support/SpyStore1'

export default class OptimisticLockingPluginTest extends AbstractSpruceFixtureTest {
	private static spy1: SpyStore1
	private static db: Database
	private static lockCollectionName: string
	private static plugin: OptimisticLockingPlugin
	private static primaryFieldName: string
	private static lockFieldName: string
	protected static async beforeEach() {
		await super.beforeEach()

		this.lockCollectionName = generateId()
		this.lockFieldName = generateId()
		this.primaryFieldName = 'id'

		const stores = await this.stores.getStoreFactory()
		stores.setStoreClass('spy1', SpyStore1)

		this.db = await this.database.connectToDatabase()
		this.spy1 = await this.stores.getStore('spy1')

		this.plugin = this.Plugin()
		this.spy1.addPlugin(this.plugin)
	}

	@test()
	protected static async throwsWhenMissingRequired() {
		//@ts-ignore
		const err = assert.doesThrow(() => OptimisticLockingPlugin.Plugin({}))

		errorAssert.assertError(err, 'MISSING_PARAMETERS', {
			parameters: [
				'database',
				'lockCollectionName',
				'primaryFieldName',
				'lockFieldName',
			],
		})
	}

	@test()
	protected static async nameIsExpectedValue() {
		assert.isEqual(this.plugin.getName(), 'optimisticLocking')
	}

	@test()
	protected static async creatingARecordAddsToTheLockCollection() {
		await this.createOne()

		const total = await this.db.count(this.lockCollectionName)
		assert.isEqual(total, 1)
	}

	@test('lock record id matches on primary field named id', 'id')
	@test(
		'lock record id matches on primary field named alternativeId',
		'alternativeId'
	)
	protected static async lockRecordIdMatchesOnPrimaryField(
		primaryFieldName: string
	) {
		this.primaryFieldName = primaryFieldName
		this.spy1.setPrimaryKeyField(this.primaryFieldName)

		this.spy1.clearPlugins()
		this.plugin = this.Plugin()
		this.spy1.addPlugin(this.plugin)

		const { lockRecord, record } = await this.createOneAndGetFirstLock()

		assert.isEqual(
			lockRecord[this.primaryFieldName],
			//@ts-ignore
			record[this.primaryFieldName]
		)
	}

	@test()
	protected static async lockRecordHasLockValue() {
		const { lockRecord } = await this.createOneAndGetFirstLock()
		assert.isTruthy(lockRecord[this.lockFieldName])
	}

	@test()
	protected static async lockFieldComesBackWithCreatedRecord() {
		const { record, lockRecord } = await this.createOneAndGetFirstLock()

		//@ts-ignore
		assert.isEqual(lockRecord[this.lockFieldName], record[this.lockFieldName])
	}

	@test()
	protected static async updatingWithoutALockThrows() {
		await this.createOne()

		await this.assertThrowsLockFieldMissing(() => {
			return this.updateOne({})
		})
	}

	@test()
	protected static async canUpdateIfLockMatches() {
		const { created, lock } = await this.createOnAndGetLock()

		await this.updateOne({
			id: created.id,
			[this.lockFieldName]: lock,
		})
	}

	@test()
	protected static async updateDoesNotMutateQuery() {
		const { created, lock } = await this.createOnAndGetLock()

		const query = {
			id: created.id,
			[this.lockFieldName]: lock,
		}

		const copy = {
			...query,
		}

		await this.updateOne(query)

		assert.isEqualDeep(query, copy)
	}

	@test()
	protected static async passingTheWrongLockOnUpdateThrows() {
		const created = await this.createOne()

		const lockValue = generateId()
		const query = {
			[this.primaryFieldName]: created.id,
			[this.lockFieldName]: lockValue,
		}
		const err = await assert.doesThrowAsync(() => this.updateOne(query))

		errorAssert.assertError(err, 'EXPIRED_LOCK', {
			lockFieldName: this.lockFieldName,
			lockValue,
		})
	}

	@test()
	protected static async deleteOneThrowsIfMissingLock() {
		await this.createOne()

		await this.assertThrowsLockFieldMissing(() => {
			return this.spy1.deleteOne({})
		})
	}

	private static async createOnAndGetLock() {
		const created = await this.createOne()
		//@ts-ignore
		const lock = created[this.lockFieldName]
		return { created, lock }
	}

	private static updateOne(query: Record<string, any>) {
		return this.spy1.updateOne(query, this.generateRandomValues())
	}

	private static async createOneAndGetFirstLock() {
		const record = await this.createOne()
		const lockRecord = await this.findFirstLockRecord()
		return { lockRecord, record }
	}

	private static async findFirstLockRecord() {
		const record = await this.db.findOne(this.lockCollectionName)
		assert.isTruthy(record, 'No lock record found')
		return record
	}

	private static Plugin(): OptimisticLockingPlugin {
		return OptimisticLockingPlugin.Plugin({
			database: this.db,
			lockCollectionName: this.lockCollectionName,
			primaryFieldName: this.primaryFieldName,
			lockFieldName: this.lockFieldName,
		})
	}

	private static async assertThrowsLockFieldMissing(cb: () => void) {
		const err = await assert.doesThrowAsync(cb)

		errorAssert.assertError(err, 'MISSING_LOCK_FIELD', {
			lockFieldName: this.lockFieldName,
		})
	}

	private static async createOne() {
		return await this.spy1.createOne(this.generateRandomValues())
	}

	private static generateRandomValues() {
		return {
			firstName: generateId(),
			lastName: generateId(),
		}
	}
}
