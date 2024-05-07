import { test, assert, errorAssert, generateId } from '@sprucelabs/test-utils'
import HistoryPlugin, {
    getIndefiniteEndDateMs,
} from '../../../history/HistoryPlugin'
import AbstractPluginTest from '../../support/AbstractPluginTest'
import HistoryStore, {
    SpyHistoryDatabaseRecord,
    SpyHistoryRecord,
} from '../../support/HistoryStore'

export default class HistoryPluginTest extends AbstractPluginTest {
    protected static spy: HistoryStore
    private static plugin: HistoryPlugin
    private static entityCollectionName: string
    private static periodIdFieldName: string
    private static entityIdFieldName: string

    protected static async beforeEach() {
        await super.beforeEach()

        const stores = await this.stores.getStoreFactory()
        stores.setStoreClass('history', HistoryStore)

        this.spy = await this.stores.getStore('history')

        this.entityCollectionName = generateId()
        this.periodIdFieldName = 'periodId'
        this.entityIdFieldName = 'entityId'
        this.plugin = this.Plugin()

        this.addPlugin(this.plugin)
    }

    @test()
    protected static async throwsWithMissingRequired() {
        //@ts-ignore
        const err = assert.doesThrow(() => HistoryPlugin.Plugin({}))
        errorAssert.assertError(err, 'MISSING_PARAMETERS', {
            parameters: [
                'store',
                'entityCollectionName',
                'periodIdFieldName',
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
        this.setEntityIdFieldName(generateId())
        const err = await assert.doesThrowAsync(() => this.createOne())
        errorAssert.assertError(err, 'MISSING_ENTITY_ID_FIELD_NAME', {
            entityIdFieldName: this.entityIdFieldName,
        })
    }

    @test()
    protected static async throwsIfPeriodIdFieldIsNotAvailable() {
        this.setPeriodIdFieldName()
        const err = await assert.doesThrowAsync(() => this.createOne())
        errorAssert.assertError(err, 'MISSING_PERIOD_ID_FIELD_NAME', {
            periodIdFieldName: this.periodIdFieldName,
        })
    }

    @test('entity record has entity id matching 1', 'entityId')
    @test('entity record has entity id matching 2', 'entityId2')
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
        await this.assertCreatingRecordAndUpdatingDoesNotCreateNewEntityRecord()
    }

    @test()
    protected static async updatingARecordDoesNotCreateNewEntityRecordWithDifferentEntityFieldName() {
        this.setEntityIdFieldName('entityId2')
        await this.assertCreatingRecordAndUpdatingDoesNotCreateNewEntityRecord()
    }

    @test()
    protected static async updatingARecordCreatesANewRecord() {
        const created = await this.createOneAndFindFull()
        await this.spy.updateOne(
            { entityId: created.entityId! },
            { firstName: generateId() }
        )

        const count = await this.db.count(this.spy.getCollectionName(), {})
        assert.isEqual(count, 2)
    }

    @test()
    protected static async creatingARecordSetsStartTs() {
        const floor = Date.now() - 1
        await this.createOne()
        const ceil = Date.now() + 1

        const match = await this.findOneFull()

        assert.isAbove(match?.createTs, floor)
        assert.isBelow(match?.createTs, ceil)
    }

    @test()
    protected static async creatingARecordSetsEndTsToIndefinateFuture() {
        await this.createOne()
        const match = await this.findOneFull()
        const end = new Date('2200-01-01 00:00:00-07')
        assert.isEqual(match?.endTs, end.getTime())
    }

    @test()
    protected static async loadingTheRecordByEntityIdReturnsOnlyRecord() {
        const created = await this.createOneAndFindFull()
        const loaded = await this.findOne(created.entityId!)
        assert.isEqual(loaded?.periodId, created.periodId)
        assert.isEqual(loaded?.entityId, created.entityId)
    }

    @test()
    protected static async updatingRecordRetainsValuesFromOriginalRecord() {
        const created = await this.createOneAndFindFull()
        const firstName = generateId()
        await this.updateOneBasedOnPeriodId(created.periodId!, {
            firstName,
        })

        const [updated] = await this.findAllFull()

        assert.isEqual(
            created.lastName,
            updated.lastName,
            'lastName should match first record'
        )
        assert.isEqual(
            updated.firstName,
            firstName,
            'firstName should match update'
        )
    }

    @test()
    protected static async updatingRecordCreatesNewWithMatchingEntityIdAndNewPeriodId() {
        await this.assertUpdatingRecordMaintainsEntityId()
    }

    @test()
    protected static async updatingRecordWithDifferentEntityFieldMaintainsEntityId() {
        this.setEntityIdFieldName('entityId2')
        await this.assertUpdatingRecordMaintainsEntityId()
    }

    @test()
    protected static async updatingDoesNotChangeFirstRecordsValues() {
        await this.createOne()
        const first = await this.findOneFull()
        await this.randomyUpdateOnlyRecord()
        const match = await this.findOneFullBasedOnPeriodId(first!.periodId)

        delete match?.endTs
        delete first?.endTs

        assert.isEqualDeep(match, first)
    }

    @test()
    protected static async updatingSetsFirstRecordsEndTsToNow() {
        await this.createOne()
        const first = await this.findOneFull()
        const floor = Date.now() - 1
        await this.randomyUpdateOnlyRecord()
        const ceil = Date.now() + 1
        const match = await this.findOneFullBasedOnPeriodId(first!.periodId)
        assert.isAbove(match?.endTs, floor)
        assert.isBelow(match?.endTs, ceil)
    }

    @test()
    protected static async updatedRecordTakesUpdatesAndMatchesStartTsToFirstRecordsEndTs() {
        const created = await this.createOneAndFindFull()
        const updates = await this.updateOneBasedOnPeriodId(created.periodId!)

        const [second, first] = await this.findAllFull()

        assert.isNotEqual(
            first.firstName,
            updates.firstName,
            'first names should not match'
        )

        assert.isNotEqual(
            first.lastName,
            updates.lastName,
            'last names should not match'
        )

        assert.isEqual(second.firstName, updates.firstName)

        assert.isEqual(second.endTs, getIndefiniteEndDateMs())

        assert.isEqual(
            second.createTs,
            first.endTs,
            'second createTs should match first endTs'
        )
    }

    @test()
    protected static async findsCurrentRecord() {
        const firstRecord = {
            periodId: '663932e1fc815dd24d06651b',
            entityId: 'd6269aa29811485c92b47089702a9c2b',
            firstName: '31ca558a7d7740aa8e1d3a586291d204',
            lastName: 'cde69c3d69024582854a151ef32fdafb',
            createTs: 1715024609220,
            endTs: 1715024609253,
        }

        const secondRecord = {
            periodId: 'a2f3ee136c484d75b6d196d9ebbd4a2f',
            entityId: 'd6269aa29811485c92b47089702a9c2b',
            firstName: '9c08adbf61444d209e515d307e707e4c',
            lastName: 'da4141c6b3c24b20b541e2bea9d75204',
            createTs: 1715024609253,
            endTs: 7258143600000,
        }

        await this.db.create(this.spy.getCollectionName(), [
            firstRecord,
            secondRecord,
        ])

        const match = await this.spy.findOne({ entityId: firstRecord.entityId })
        assert.isEqual(match?.periodId, secondRecord.periodId)
    }

    @test()
    protected static async canFindByField() {
        const firstEntityId = await this.createOneAndFindFull()
        await this.createOneAndFindFull()

        const match = await this.spy.findOne({
            firstName: firstEntityId.firstName,
        })

        assert.isEqual(firstEntityId.periodId, match?.periodId)
    }

    @test()
    protected static async canFindCurrentRecordByField() {
        await this.createOne()
        const updates = await this.randomyUpdateOnlyRecord()
        const [first] = await this.findAllFull()

        await this.createOne()

        const match = await this.spy.findOne({
            lastName: updates.lastName,
        })

        assert.isEqual(match?.periodId, first?.periodId)
    }

    @test()
    protected static async canUpdateSecondRecord() {
        const firstCreated = await this.createOneAndFindFull()
        const secondCreated = await this.createOneAndFindFull()
        await this.updateOneBasedOnPeriodId(secondCreated.periodId!)

        const [current, second] = await this.findAllFull()

        assert.isNotEqual(
            current.entityId,
            firstCreated.entityId,
            `Updated first record and should have updated second record`
        )
        assert.isEqual(current.entityId, second.entityId)
    }

    @test()
    protected static async updatingARecordBehavesAsExpected() {
        const err = await assert.doesThrowAsync(() =>
            this.updateOneBasedOnPeriodId(generateId())
        )
        errorAssert.assertError(err, 'RECORD_NOT_FOUND')
    }

    @test()
    protected static async canUpdateOneWithDifferentEntityId() {
        this.setEntityIdFieldName('entityId2')
        const created = await this.createOneAndFindFull()
        await this.updateOneBasedOnPeriodId(created.periodId!)

        const [current, first] = await this.findAllFull()
        assert.isFalsy(current.entityId)
        assert.isTruthy(current.entityId2)
        assert.isEqual(current.entityId2, first.entityId2)
    }

    @test()
    protected static async canUpdateOneWithDifferentPeriodId() {
        this.setPeriodIdFieldName('periodId2')
        const created = await this.createOneAndFindFull()
        await this.updateOneBasedOnPeriodId(created.periodId2!)

        const [current, first] = await this.findAllFull()

        assert.isFalsy(current.periodId)
        assert.isTruthy(current.periodId2)
        assert.isEqual(current.entityId, first.entityId)
    }

    private static async findOneFullBasedOnPeriodId(periodId: any) {
        return await this.findOneFull({ periodId })
    }

    private static async randomyUpdateOnlyRecord() {
        const updates = this.generateSpyRandomValues()
        await this.spy.updateOne({}, updates)
        return updates
    }

    private static async findOneFull(
        query: Record<string, any> = {}
    ): Promise<SpyHistoryDatabaseRecord | null> {
        return await this.spy
            .getDb()
            .findOne(this.spy.getCollectionName(), query)
    }

    private static async findAllFull(): Promise<SpyHistoryDatabaseRecord[]> {
        return await this.spy.getDb().find(
            this.spy.getCollectionName(),
            {},
            {
                sort: [{ field: 'createTs', direction: 'desc' }],
            }
        )
    }

    private static async findOne(entityId: string) {
        return await this.spy.findOne({ entityId })
    }

    private static Plugin(): HistoryPlugin {
        return HistoryPlugin.Plugin({
            store: this.spy,
            entityCollectionName: this.entityCollectionName,
            periodIdFieldName: this.periodIdFieldName,
            entityIdFieldName: this.entityIdFieldName,
        })
    }

    private static async createOneAndFindFull() {
        const record = await this.createOne()
        const created = await this.findOneFull({
            //@ts-ignore
            [this.periodIdFieldName]: record[this.periodIdFieldName],
        })
        return created!
    }

    private static async createOneAndUpdateWithRandomValues() {
        const created = await this.createOne()
        const updates = this.generateSpyRandomValues()
        const periodId = created.periodId!
        await this.updateOneBasedOnPeriodId(periodId, updates)
        return updates
    }

    private static async updateOneBasedOnPeriodId(
        periodId: string,
        updates: Partial<SpyHistoryRecord> = this.generateSpyRandomValues()
    ) {
        await this.spy.updateOne(
            { [this.periodIdFieldName]: periodId },
            updates
        )
        return updates
    }

    protected static async createOne() {
        return super.createOne() as SpyHistoryDatabaseRecord
    }

    private static setEntityIdFieldName(entityIdFieldName: string) {
        this.entityIdFieldName = entityIdFieldName
        this.reloadPlugin()
    }

    private static reloadPlugin() {
        this.spy.clearPlugins()
        this.plugin = this.Plugin()
        this.addPlugin(this.plugin)
    }

    private static async getFirstEntityRecord() {
        const first = await this.db.findOne(this.entityCollectionName, {})
        assert.isTruthy(first, 'no entity record written')
        return first
    }

    private static setPeriodIdFieldName(name?: string) {
        this.periodIdFieldName = name ?? generateId()
        this.reloadPlugin()
        //@ts-ignore
        this.spy.setPrimaryFieldNames([this.periodIdFieldName])
    }

    private static async assertUpdatingRecordMaintainsEntityId() {
        const updates = await this.createOneAndUpdateWithRandomValues()
        const [updated, first] = await this.findAllFull()

        assert.isTruthy(updated.periodId)

        assert.isEqual(
            //@ts-ignore
            updated[this.entityIdFieldName],
            //@ts-ignore
            first[this.entityIdFieldName],
            "Entity id's should match"
        )

        assert.isNotEqual(
            updated.periodId,
            first.periodId,
            'periodId should not match'
        )
        assert.doesInclude(updated, updates, 'updated should include updates')
    }

    private static async assertCreatingRecordAndUpdatingDoesNotCreateNewEntityRecord() {
        await this.createOneAndUpdateWithRandomValues()
        const count = await this.db.count(this.entityCollectionName, {})
        assert.isEqual(count, 1)
    }
}
