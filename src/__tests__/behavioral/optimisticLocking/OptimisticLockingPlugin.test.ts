import { test, assert, errorAssert, generateId } from '@sprucelabs/test-utils'
import OptimisticLockingPlugin, {
	OptimisticLockingPluginOptions,
} from '../../../optimisticLocking/OptimisticLockingPlugin'
import AbstractPluginTest from '../../support/AbstractPluginTest'

export default class OptimisticLockingPluginTest extends AbstractPluginTest {
	private static lockCollectionName: string
	private static plugin: OptimisticLockingPlugin
	private static primaryFieldName: string
	private static lockFieldName: string

	protected static async beforeEach() {
		await super.beforeEach()

		this.lockCollectionName = generateId()
		this.lockFieldName = generateId()
		this.primaryFieldName = 'id'

		this.plugin = this.Plugin()
		const plugin = this.plugin
		this.addPlugin(plugin)
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
		this.spy.setPrimaryKeyField(this.primaryFieldName)

		this.spy.clearPlugins()
		this.plugin = this.Plugin()
		this.spy.addPlugin(this.plugin)

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
		const { created, lock } = await this.createOneAndGetLock()

		await this.updateOne({
			id: created.id,
			[this.lockFieldName]: lock,
		})
	}

	@test()
	protected static async updateDoesNotMutateQuery() {
		const { created, lock } = await this.createOneAndGetLock()

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

		await this.assertThrowsLockExpired(() => {
			return this.updateOne({
				[this.primaryFieldName]: created.id,
				[this.lockFieldName]: lockValue,
			})
		}, lockValue)
	}

	@test()
	protected static async deleteOneThrowsIfMissingLock() {
		await this.createOne()

		await this.assertThrowsLockFieldMissing(() => {
			return this.spy.deleteOne({})
		})
	}

	@test()
	protected static async passingTheWrongLockOnDeleteThrows() {
		const { created } = await this.createOneAndGetLock()

		const lockValue = generateId()

		await this.assertThrowsLockExpired(() => {
			return this.spy.deleteOne({
				[this.primaryFieldName]: created.id,
				[this.lockFieldName]: lockValue,
			})
		}, lockValue)
	}

	@test()
	protected static async canDeleteIfLockMatches() {
		const { created, lock } = await this.createOneAndGetLock()

		await this.spy.deleteOne({
			[this.primaryFieldName]: created.id,
			[this.lockFieldName]: lock,
		})

		const count = await this.spy.count({})
		assert.isEqual(count, 0)
	}

	@test()
	protected static async findOneReturnsLock() {
		const { created, lock } = await this.createOneAndGetLock()

		const found = await this.findOne(created.id)

		//@ts-ignore
		assert.isEqual(found?.[this.lockFieldName], lock)
	}

	@test()
	protected static async findOneCanTellLocksApart() {
		const { created } = await this.createOneAndGetLock()

		const lockValue = await this.createRandomLock()
		const found = await this.findOne(created.id!)

		//@ts-ignore
		assert.isNotEqual(found?.[this.lockFieldName], lockValue)
	}

	@test()
	protected static async canOverrideClass() {
		OptimisticLockingPlugin.Class = SpyPlugin
		const plugin = this.Plugin()
		assert.isInstanceOf(plugin, SpyPlugin)
	}

	private static async createRandomLock() {
		const lockValue = generateId()
		await this.db.createOne(this.lockCollectionName, {
			[this.primaryFieldName]: generateId(),
			[this.lockFieldName]: lockValue,
		})
		return lockValue
	}

	private static async findOne(id: string | null | undefined) {
		return await this.spy.findOne({
			[this.primaryFieldName]: id,
		})
	}

	private static async assertThrowsLockExpired(
		cb: () => void,
		lockValue: string
	) {
		const err = await assert.doesThrowAsync(cb)

		errorAssert.assertError(err, 'EXPIRED_LOCK', {
			lockFieldName: this.lockFieldName,
			lockValue,
		})
	}

	private static async createOneAndGetLock() {
		const created = await this.createOne()
		//@ts-ignore
		const lock = created[this.lockFieldName]
		return { created, lock }
	}

	private static updateOne(query: Record<string, any>) {
		return this.spy.updateOne(query, this.generateSpyRandomValues())
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
}

class SpyPlugin extends OptimisticLockingPlugin {
	public constructor(options: OptimisticLockingPluginOptions) {
		super(options)
	}
}
