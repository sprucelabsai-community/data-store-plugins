import { SpruceErrors } from "#spruce/errors/errors.types"
import { ErrorOptions as ISpruceErrorOptions} from "@sprucelabs/error"

export interface MissingLockFieldErrorOptions extends SpruceErrors.DataStorePlugins.MissingLockField, ISpruceErrorOptions {
	code: 'MISSING_LOCK_FIELD'
}
export interface ExpiredLockErrorOptions extends SpruceErrors.DataStorePlugins.ExpiredLock, ISpruceErrorOptions {
	code: 'EXPIRED_LOCK'
}

type ErrorOptions =  | MissingLockFieldErrorOptions  | ExpiredLockErrorOptions 

export default ErrorOptions
