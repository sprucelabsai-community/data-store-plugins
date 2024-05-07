import { test, assert, errorAssert, generateId } from '@sprucelabs/test-utils'
import HistoryPlugin, {
    HistoryPluginOptions,
} from '../../../history/HistoryPlugin'
import historyPluginAssert, {
    HistoryPluginAssertSettings,
} from '../../../history/historyPluginAssert'
import AbstractPluginTest from '../../support/AbstractPluginTest'

export default class AssertingHistoryPluginTest extends AbstractPluginTest {
    @test()
    protected static async throwsWhenWissing() {
        const err = assert.doesThrow(() =>
            //@ts-ignore
            historyPluginAssert.pluginHasSettings()
        )

        errorAssert.assertError(err, 'MISSING_PARAMETERS', {
            parameters: ['plugin', 'settings'],
        })
    }

    @test()
    protected static async passesWithCorrectSettings() {
        this.assertPluginSettings({
            entityCollectionName: generateId(),
            entityIdFieldName: generateId(),
            periodIdFieldName: generateId(),
        })
    }

    @test()
    protected static async throwsIfEntityCollectionNameDifferent() {
        this.assertThrowsWithSettingOverridden({
            entityCollectionName: generateId(),
        })
    }

    @test()
    protected static async throwsIfEntityIdFieldNameDifferent() {
        this.assertThrowsWithSettingOverridden({
            entityIdFieldName: generateId(),
        })
    }

    @test()
    protected static async throwsIfPeriodIdFieldNameDifferent() {
        this.assertThrowsWithSettingOverridden({
            periodIdFieldName: generateId(),
        })
    }

    private static assertThrowsWithSettingOverridden(
        overrides: Partial<HistoryPluginOptions>
    ) {
        const settings = {
            entityCollectionName: generateId(),
            entityIdFieldName: generateId(),
            periodIdFieldName: generateId(),
        }

        const expected = {
            ...settings,
            ...overrides,
        }

        assert.doesThrow(() => this.assertPluginSettings(settings, expected))
    }

    private static assertPluginSettings(
        settings: HistoryPluginAssertSettings,
        expected?: HistoryPluginAssertSettings
    ) {
        const plugin = HistoryPlugin.Plugin({
            store: this.spy,
            ...settings,
        })

        historyPluginAssert.pluginHasSettings(plugin, expected ?? settings)
    }
}
