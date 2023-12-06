import {
	AbstractStore,
	DataStorePlugin,
	Database,
} from '@sprucelabs/data-stores'
import { Schema, assertOptions } from '@sprucelabs/schema'
import { test, assert, errorAssert, generateId } from '@sprucelabs/test-utils'
import SpruceError from '../../../errors/SpruceError'
import AbstractPluginTest from '../../support/AbstractPluginTest'

export default class HistoryPluginTest extends AbstractPluginTest {
	private static plugin: HistoryPlugin
	private static entityCollectionName: string
	private static idFieldName: string
	private static entityIdFieldName: string

	protected static async beforeEach() {
		await super.beforeEach()
		this.entityCollectionName = generateId()
		this.idFieldName = 'id'
		this.entityIdFieldName = 'alternativeId'

		this.plugin = this.Plugin()

		this.addPlugin(this.plugin)
	}

	private static Plugin(): HistoryPlugin {
		return HistoryPlugin.Plugin({
			store: this.spy,
			entityCollectionName: this.entityCollectionName,
			idFieldName: this.idFieldName,
			entityIdFieldName: this.entityIdFieldName,
		})
	}

	@test()
	protected static async throwsWithMissingRequired() {
		//@ts-ignore
		const err = assert.doesThrow(() => HistoryPlugin.Plugin({}))
		errorAssert.assertError(err, 'MISSING_PARAMETERS', {
			parameters: [
				'store',
				'entityCollectionName',
				'idFieldName',
				'entityIdFieldName',
			],
		})
	}

	@test()
	protected static async hasExpectedName() {
		assert.isEqual(this.plugin.getName(), 'history')
	}

	@test()
	protected static async createsEntityRecordWhenRecordIsCreated() {
		await this.createOne()
		await this.getFirstEntityRecord()
	}

	@test()
	protected static async throwsIfEntityIdFieldNameIsNotAvailable() {
		const entityIdFieldName = generateId()
		this.setEntityIdFieldName(entityIdFieldName)
		const err = await assert.doesThrowAsync(() => this.createOne())
		errorAssert.assertError(err, 'MISSING_ENTITY_ID_FIELD_NAME', {
			entityIdFieldName,
		})
	}

	@test('entity record has entity id matching 1', 'alternativeId')
	@test('entity record has entity id matching 2', 'alternativeId2')
	protected static async entityRecordHasEntityIdMatching(
		entityIdFieldName: string
	) {
		this.setEntityIdFieldName(entityIdFieldName)

		const created = await this.createOne()

		//@ts-ignore
		const expected = created[this.entityIdFieldName]
		assert.isTruthy(expected)

		const entity = await this.getFirstEntityRecord()
		assert.isEqual(entity[this.entityIdFieldName], expected)

		const match = await this.spy.findOne({})
		assert.isTruthy(match)

		//@ts-ignore
		assert.isEqual(match[this.entityIdFieldName], expected)
	}

	@test()
	protected static async updatingARecordDoesNotCreateNewEntityRecord() {
		await this.createOneAndUpdateWithRandomValues()
		const count = await this.db.count(this.entityCollectionName, {})
		assert.isEqual(count, 1)
	}

	@test()
	protected static async updatingARecordDoesNotCreateNewRecord() {
		const created = await this.createOne()
		await this.spy.updateOne({ id: created.id! }, { firstName: generateId() })

		const count = await this.db.count(this.spy.getCollectionName(), {})
		assert.isEqual(count, 2)
	}
	private static async createOneAndUpdateWithRandomValues() {
		const created = await this.createOne()
		await this.spy.updateOne(
			{ id: created.id! },
			this.generateSpyRandomValues()
		)
	}

	private static setEntityIdFieldName(entityIdFieldName: string) {
		this.entityIdFieldName = entityIdFieldName
		this.spy.clearPlugins()
		this.plugin = this.Plugin()
		this.addPlugin(this.plugin)
	}

	private static async getFirstEntityRecord() {
		const first = await this.db.findOne(this.entityCollectionName, {})
		assert.isTruthy(first, 'no entity record written')
		return first
	}
}

class HistoryPlugin implements DataStorePlugin {
	private db: Database
	private entityCollectionName: string
	private entityIdFieldName: string
	private store: AbstractStore<Schema>

	protected constructor(options: HistoryPluginOptions) {
		const { store, entityCollectionName, entityIdFieldName } = options
		this.db = store.getDb()
		this.store = store
		this.entityCollectionName = entityCollectionName
		this.entityIdFieldName = entityIdFieldName
	}

	public static Plugin(options: HistoryPluginOptions) {
		assertOptions(options, [
			'store',
			'entityCollectionName',
			'idFieldName',
			'entityIdFieldName',
		])
		return new this(options)
	}

	public getName(): string {
		return 'history'
	}

	public async willCreateOne() {
		const id = generateId()
		await this.db.createOne(this.entityCollectionName, {
			[this.entityIdFieldName]: id,
		})

		return {
			valuesToMixinBeforeCreate: {
				[this.entityIdFieldName]: id,
			},
		}
	}

	public async willUpdateOne() {
		await this.db.createOne(this.store.getCollectionName(), {})
		return {}
	}

	public async didCreateOne(record: Record<string, any>) {
		if (!record[this.entityIdFieldName]) {
			throw new SpruceError({
				code: 'MISSING_ENTITY_ID_FIELD_NAME',
				entityIdFieldName: this.entityIdFieldName,
			})
		}
	}
}

interface HistoryPluginOptions {
	store: AbstractStore<Schema>
	entityCollectionName: string
	idFieldName: string
	entityIdFieldName: string
}
