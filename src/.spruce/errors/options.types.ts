import { SpruceErrors } from "#spruce/errors/errors.types"
import { ErrorOptions as ISpruceErrorOptions} from "@sprucelabs/error"

export interface MissingPeriodIdFieldNameErrorOptions extends SpruceErrors.DataStorePlugins.MissingPeriodIdFieldName, ISpruceErrorOptions {
	code: 'MISSING_PERIOD_ID_FIELD_NAME'
}
export interface MissingLockFieldErrorOptions extends SpruceErrors.DataStorePlugins.MissingLockField, ISpruceErrorOptions {
	code: 'MISSING_LOCK_FIELD'
}
export interface MissingEntityIdFieldNameErrorOptions extends SpruceErrors.DataStorePlugins.MissingEntityIdFieldName, ISpruceErrorOptions {
	code: 'MISSING_ENTITY_ID_FIELD_NAME'
}
export interface ExpiredLockErrorOptions extends SpruceErrors.DataStorePlugins.ExpiredLock, ISpruceErrorOptions {
	code: 'EXPIRED_LOCK'
}

type ErrorOptions =  | MissingPeriodIdFieldNameErrorOptions  | MissingLockFieldErrorOptions  | MissingEntityIdFieldNameErrorOptions  | ExpiredLockErrorOptions 

export default ErrorOptions
