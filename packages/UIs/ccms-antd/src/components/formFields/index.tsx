import TextField from './text'
import FormField from './form'
import RadioField from './radio'
import ColorField from './color'
import UploadField from './upload'
import LongTextField from './longtext'
import NumberField from './number'
import DatetimeField from './datetime'
import DatetimeRangeField from './datetimeRange'
import SelectSingleField from './select/single'
import SelectMultipleField from './select/multiple'
import DescField from './description'
import ImageUrlField from './imageurl'
import SwitchField from './switch'
import GroupField from './group'
import HiddenField from './hidden'
import TabsField from './tabs'
import MultipleTextField from './multipleText'
import CustomField from './custom'
import ImportSubformField from './importSubform'
import AnyField from './any'

import TextDisplayComponent from './text/display'
import LongTextDisplayComponent from './longtext/display'
import RadioDisplayComponent from './radio/display'
import ColorDisplayComponent from './color/display'
import NumberDisplayComponent from './number/display'
import SwitchDisplayComponent from './switch/display'
import UploadDisplayComponent from './upload/display'
import DatetimeDisplayComponent from './datetime/display'
import DatetimeRangeDisplayComponent from './datetimeRange/display'
import SelectSingleDisplayComponent from './select/single/display'
import SelectMultipleDisplayComponent from './select/multiple/display'

export default {
  text: TextField,
  form: FormField,
  radio: RadioField,
  longtext: LongTextField,
  number: NumberField,
  switch: SwitchField,
  datetime: DatetimeField,
  datetimeRange: DatetimeRangeField,
  select_single: SelectSingleField,
  select_multiple: SelectMultipleField,
  desc: DescField,
  color: ColorField,
  upload: UploadField,
  imageurl: ImageUrlField,
  group: GroupField,
  hidden: HiddenField,
  tabs: TabsField,
  multiple_text: MultipleTextField,
  custom: CustomField,
  import_subform: ImportSubformField,
  any: AnyField
}

export const display = {
  text: TextDisplayComponent,
  radio: RadioDisplayComponent,
  longtext: LongTextDisplayComponent,
  number: NumberDisplayComponent,
  switch: SwitchDisplayComponent,
  datetime: DatetimeDisplayComponent,
  datetimeRange: DatetimeRangeDisplayComponent,
  select_single: SelectSingleDisplayComponent,
  select_multiple: SelectMultipleDisplayComponent,
  color: ColorDisplayComponent,
  upload: UploadDisplayComponent
}