import BaseSpruceError from '@sprucelabs/error'
import ErrorOptions from '#spruce/errors/options.types'

export default class SpruceError extends BaseSpruceError<ErrorOptions> {
    /** an easy to understand version of the errors */
    public friendlyMessage(): string {
        const { options } = this
        let message
        switch (options?.code) {
            case 'MISSING_LOCK_FIELD':
                message = `Optimistic Locking Error: You have to pass the lock in your query. Example: { ${options.lockFieldName}: ... }`
                break

            case 'EXPIRED_LOCK':
                message = `The lock on this item has expired. This probably means someone updated it before you could.`
                break
            case 'MISSING_ENTITY_ID_FIELD_NAME':
                message = `Your store is missing the entity id field named '${options.entityIdFieldName}'. You need to add it to the full schema of our store for best results`
                break

            case 'MISSING_PERIOD_ID_FIELD_NAME':
                message = `Your store is missing the period id field named '${options.periodIdFieldName}'. You need to add it to the full schema of our store for best results`
                break

            default:
                message = super.friendlyMessage()
        }

        const fullMessage = options.friendlyMessage
            ? options.friendlyMessage
            : message

        return fullMessage
    }
}
