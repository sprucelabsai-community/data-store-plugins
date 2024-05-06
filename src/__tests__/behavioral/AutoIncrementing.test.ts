import {
    DataStorePlugin,
    DataStorePluginDidCreateOneResponse,
    DataStorePluginDidFindOneResponse,
    DataStorePluginPrepareResponse,
    DataStorePluginWillCreateOneResponse,
    DataStorePluginWillDeleteOneResponse,
    DataStorePluginWillUpdateOneResponse,
    Database,
} from '@sprucelabs/data-stores'
import { assertOptions } from '@sprucelabs/schema'
import { test, assert, errorAssert, generateId } from '@sprucelabs/test-utils'
import AbstractPluginTest from '../support/AbstractPluginTest'

export default class AutoIncrementingTest extends AbstractPluginTest {
    private static plugin: AutoIncrementingPlugin

    public static async beforeEach() {
        await super.beforeEach()

        this.plugin = AutoIncrementingPlugin.Plugin({
            database: this.db,
            fieldName: 'id',
        })

        this.addPlugin(this.plugin)
    }

    @test()
    protected static async throwsWithMissing() {
        const error = assert.doesThrow(() => AutoIncrementingPlugin.Plugin({}))
        errorAssert.assertError(error, 'MISSING_PARAMETERS', {
            parameters: ['database', 'fieldName'],
        })
    }

    @test()
    protected static async nameIsExpectedValue() {
        assert.isEqual(this.plugin.getName(), 'autoIncrementing')
    }

    @test()
    protected static async createdRecordHasFieldNameEqualToOne() {
        const record = await this.createOne()
        debugger
        assert.isEqual(record.id, 1)
    }
}

class AutoIncrementingPlugin implements DataStorePlugin {
    public getName(): string {
        return 'autoIncrementing'
    }

    public async willCreateOne(
        record: Record<string, any>
    ): Promise<DataStorePluginWillCreateOneResponse> {
        debugger
        return {
            valuesToMixinBeforeCreate: {
                id: 1,
            },
        }
    }

    public static Plugin(options: AutoIncrementingPluginOptions) {
        assertOptions(options, ['database', 'fieldName'])
        return new this()
    }
}

export interface AutoIncrementingPluginOptions {
    database: Database
    fieldName: string
}
