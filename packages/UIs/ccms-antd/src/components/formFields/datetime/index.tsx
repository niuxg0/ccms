import * as React from 'react'
import { DatetimeField } from 'ccms'
import { DatePicker, TimePicker } from 'antd'
import { IDatetimeField, DatetimeFieldConfig } from 'ccms/dist/src/components/formFields/datetime'
import pickerLocale from 'antd/lib/date-picker/locale/zh_CN'

export default class DatetimeFieldComponent extends DatetimeField {
  renderComponent = (props: IDatetimeField) => {
    const {
      value,
      disabled,
      readonly,
      mode,
      placeholder
    } = props

    if (mode === 'time') {
      return (
        <TimePicker
          disabled={disabled}
          inputReadOnly={readonly}
          style={{ width: '100%' }}
          value={value}
          format={props.format}
          locale={pickerLocale}
          placeholder={placeholder}
          onChange={async (time) => await props.onChange(time)}
          getPopupContainer={(ele) => ele.parentElement || document.body}
        />
      )
    } else if (mode === 'date') {
      return (
        <DatePicker
          disabled={disabled}
          inputReadOnly={readonly}
          style={{ width: '100%' }}
          value={value}
          format={props.format}
          locale={pickerLocale}
          placeholder={placeholder}
          onChange={async (time) => await props.onChange(time)}
          getPopupContainer={(ele) => ele.parentElement || document.body}
        />
      )
    } else if (mode === 'datetime') {
      return (
        <DatePicker
          disabled={disabled}
          inputReadOnly={readonly}
          style={{ width: '100%' }}
          value={value}
          format={props.format}
          locale={pickerLocale}
          placeholder={placeholder}
          showTime={true}
          onChange={async (time) => await props.onChange(time)}
          getPopupContainer={(ele) => ele.parentElement || document.body}
        />
      )
    } else {
      return (
        <DatePicker
          disabled={disabled}
          inputReadOnly={readonly}
          style={{ width: '100%' }}
          value={value}
          format={props.format}
          picker={mode}
          locale={pickerLocale}
          placeholder={placeholder}
          onChange={async (time) => await props.onChange(time)}
          getPopupContainer={(ele) => ele.parentElement || document.body}
        />)
    }
  }
}
