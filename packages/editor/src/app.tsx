import React from 'react';
import { Drawer, Button, Modal, message, Card, Space, Radio, Dropdown, Menu, Tree } from 'antd'
import Editor from '@monaco-editor/react'
import { DownOutlined } from '@ant-design/icons'
import { CCMS as CCMSAntDesign } from 'ccms-antd'
import { CCMSConfig, BasicConfig, PageListItem } from "ccms/dist/src/main";
import { FormConfig } from 'ccms/dist/src/steps/form';
import { cloneDeep } from "lodash";
import { PageTemplate, PageTemplates, StepConfigs, StepTemplates } from './steps'
import copy from 'copy-html-to-clipboard';
import CCMSForm from './component/CCMSForm';
import './antd.less'; // 加载antd样式（用于样式隔离）
import './app.less';
import ConfigJSON from './component/ConfigJSON';
import { StepConfigs as IStepConfigs } from 'ccms/dist/src/steps';
import { TreeSelectFieldOption } from "ccms/dist/src/components/formFields/treeSelect";
import { DataNode } from 'antd/lib/tree';

/**
 * 页面配置
 */
const basicForm: FormConfig = {
  type: 'form',
  layout: 'horizontal',
  defaultValue: {
    "source": "data",
    "field": ""
  },
  fields: [
    {
      label: "页面标题",
      field: "title",
      type: "text",
      defaultValue: {
        source: "static",
        value: ""
      }
    },
    {
      label: "页面描述",
      field: "description",
      type: "group",
      fields: [
        {
          label: "内容格式",
          field: "type",
          type: "select_single",
          mode: "button",
          options: {
            from: "manual",
            data: [
              {
                value: "plain",
                label: "纯文本"
              },
              {
                value: "markdown",
                label: "MarkDown"
              },
              {
                value: "html",
                label: "HTML"
              }
            ]
          }
        },
        {
          label: "内容",
          field: "content",
          type: "longtext",
          defaultValue: {
            source: "static",
            value: ""
          }
        }
      ]
    }
  ],
  actions: [],
  rightTopActions: []
}


export interface AppPropsInterface {
  config: CCMSConfig,
  sourceData: { [field:string]: unknown },
  applicationName?: string,
  type?: 'application' | 'business',
  version?: string,
  subversion?: string,
  baseRoute: string,
  checkPageAuth: (pageID: any) => Promise<boolean>
  loadPageURL: (pageID: any) => Promise<string>
  loadPageFrameURL: (pageID: any) => Promise<string>
  loadPageConfig: (pageID: any) => Promise<CCMSConfig>
  loadPageList: () => Promise<Array<PageListItem>>
  loadDomain: (name: string) => Promise<string>
  handlePageRedirect?: (path: string, replaceHistory: boolean) => void
  onChange: (value: any) => void
  onSubmit: (config: CCMSConfig) => void
  onCancel: () => void
  siderWidth?: number
}
export interface AppExternalProps extends AppPropsInterface {
  customConfigCDN?: string
}
export interface AppProps  extends AppPropsInterface {
  configDomain?: string
}

interface PageConfig extends CCMSConfig {
  ui: 'antd'
}

export interface CCMSConsigState {
  ready: boolean,
  pageConfig: PageConfig
  activeTab: number
  pageTemplate: PageTemplate
  configStringify: boolean
}

class App extends React.Component<AppProps, CCMSConsigState> {

  state: CCMSConsigState = {
    pageConfig: cloneDeep(this.props.config) as PageConfig, // 页面配置
    activeTab: -1, // 活跃tab
    pageTemplate: 'normal-form', // 页面类型
    ready: true,  // 是否展示，用于刷新
    configStringify: false
  }

  componentDidMount() {
    const { pageConfig } = this.state
    const steps = pageConfig.steps || []

    for (const [ pageTemplate, stepTemplates ] of Object.entries(PageTemplates)) {
      if (stepTemplates.length === steps.length) {
        let match = true
        for (let i = 0; i < steps.length; i++) {
          if (stepTemplates[i].step !== steps[i].type) {
            match = false
            break
          }
        }
        if (match) {
          this.setState({
            pageTemplate: pageTemplate as PageTemplate
          })
          break
        }
      }
    }

    if (!pageConfig.ui) {
      pageConfig.ui = 'antd'
      this.setState({
        pageConfig
      })
    }
  }

  /**
   * 强制刷新
   */
  handleRefreshPreview = () => {
    this.setState({
      ready: false
    }, () => {
      this.setState({
        ready: true
      })
    })
  }

  /**
   * 页面保存
   */
  handleSave = () => {
    if (this.props.onSubmit) {
      this.props.onSubmit(this.state.pageConfig)
    }
  }

  /**
   * 修改页面配置
   * @param basic 
   */
  handleChangeBasic = (basic: BasicConfig) => {
    const { pageConfig } = this.state
    pageConfig.basic = basic
    this.setState({
      pageConfig
    })
  }

  /**
   * 修改页面模板
   * @param pageTemplate 
   */
  handleChangePageMode = (pageTemplate: PageTemplate) => {
    Modal.confirm({
      title: '确定要修改页面类型吗？',
      content: '修改页面类型会丢失部分页面内容数据。',
      okText: '修改',
      cancelText: '取消',
      onOk: () => {
        const { pageConfig } = this.state
        pageConfig.steps = []

        const steps = PageTemplates[pageTemplate]
        for (const step of steps) {
          pageConfig.steps.push(StepTemplates[step.step])
        }

        this.setState({
          pageTemplate,
          pageConfig
        })
      },
      getContainer: () => document.getElementById('ccms-config') || document.body
    })
  }

  handleFieldType(type: string): string {
    switch (type) {
      case 'text':
        return '文本框'
      case 'longtext':
        return '长文本'
      case 'multiple_text':
        return '文本列表'
      case 'number':
        return '数值'
      case 'select_single':
        return '单选框'
      case 'select_multiple':
        return '复选框'
      case 'switch':
        return '开关'
      case 'datetime':
        return '时间日期'
      case 'datetimeRange':
        return '时间日期范围'
      case 'tree_select':
        return '树形选框'
      case 'color':
        return '取色器'
      case 'upload':
        return '文件上传'
      case 'form':
        return '子表单'
      case 'table':
        return '子表格'
      case 'group':
        return '群组'
      case 'tabs':
        return 'Tabs'
      case 'hidden':
        return '隐藏'
      case 'import_subform':
        return '动态子表单'
      default:
        return type
    }
  }

  handleColumnType(type: string): string {
    switch (type) {
      case 'text':
        return '文本'
      case 'number':
        return '数值'
      case 'datetime':
        return '时间日期'
      case 'datetimeRange':
        return '时间日期范围'
      case 'Aenum':
        return '选项'
      case 'image':
        return '图片'
      default:
        return type
    }
  }

  handleOutline(config: Record<string, unknown>, prefix = ''): DataNode[] | undefined {
    const children: DataNode[] = []
    if (Object.prototype.hasOwnProperty.call(config, 'fields')) {
      const handleFieldsOutline = (fields: Record<string, unknown>[]) => {
        return fields.map((field) => ({
          title: `${this.handleFieldType(field.type as string)} - ${field.label ? field.label : '-'}`,
          key: `${prefix}fields-${field.type}${field.label ? `|${field.label}` : ''}`,
          children: this.handleOutline(field, `${prefix}fields-${field.type}${field.label ? `|${field.label}` : ''}`)
        }))
      }
      children.push({
        title: '字段',
        key: `${prefix}fields`,
        children: handleFieldsOutline(config.fields as Record<string, unknown>[])
      })
    }
    if (Object.prototype.hasOwnProperty.call(config, 'tableColumns')) {
      const handleColumnsOutline = (columns: Record<string, unknown>[]) => {
        return columns.map((column) => ({
          title: `${this.handleColumnType(column.type as string)} - ${column.label ? column.label : '-'}`,
          key: `${prefix}fields-${column.type}${column.label ? `|${column.label}` : ''}`,
          children: this.handleOutline(
            column,
            `${prefix}fields-${column.type}${column.label ? `|${column.label}` : ''}`
          )
        }))
      }
      children.push({
        title: '列',
        key: `${prefix}columns`,
        children: handleColumnsOutline(config.fields as Record<string, unknown>[])
      })
    }
    if (children.length) {
      return children
    } else {
      return undefined
    }
  }

  render() {
    const {
      ready,
      pageConfig,
      activeTab,
      pageTemplate
    } = this.state

    const {
      applicationName,
      type,
      checkPageAuth,
      loadPageURL,
      loadPageFrameURL,
      loadPageConfig,
      loadPageList,
      loadDomain,
      handlePageRedirect,
      onCancel
    } = this.props

    const CCMS = CCMSAntDesign

    return (
      <div id="ccms-config" className="ccms-config" style={{ padding: 0, height: '100vh' }}>
        {/* 预览CCMS */}
        <div className="preview">
          {ready && (
            <div style={{ display: 'flex' }}>
              <div style={{ width: 500, padding: '0 20px', overflow: 'auto', height: '100vh' }}>
                <CCMS
                  checkPageAuth={checkPageAuth}
                  loadPageURL={loadPageURL}
                  loadPageFrameURL={loadPageFrameURL}
                  loadPageConfig={loadPageConfig}
                  loadPageList={loadPageList}
                  loadDomain={loadDomain}
                  handlePageRedirect={handlePageRedirect}
                  sourceData={this.props.sourceData}
                  baseRoute={this.props.baseRoute}
                  callback={() => {
                    // if (window.history.length > 1) {
                    //   window.history.back()
                    // } else {
                    //   window.close()
                    // }
                  }}
                  config={pageConfig}
                />
              </div>
              <div style={{ width: 500, border: '1px solid', marginLeft: 160 }}>
                <span>
                  <Tree
                    showIcon
                    defaultExpandAll
                    treeData={[
                      {
                        title: '页面大纲',
                        key: 'root',
                        children: PageTemplates[pageTemplate].map(({ label, step }, index) => {
                          return {
                            key: step,
                            title: label,
                            children: this.handleOutline(
                              (pageConfig.steps || [])[index] as unknown as Record<string, unknown>
                            )
                          }
                        })
                      }
                    ]}
                  />
                </span>
              </div>
              <div style={{ width: 500, border: '1px solid', marginLeft: 160 }}>
                <Editor
                  theme="vs-dark"
                  height="100vh"
                  language="json"
                  value={JSON.stringify(pageConfig, undefined, 2)}
                  options={{ fontSize: 10 }}
                />
              </div>
            </div>
          )}
        </div>

        {/* 配置化步骤内容 */}
        <Drawer
          width={500}
          mask={false}
          placement="right"
          closable={false}
          visible={true}
          getContainer={false}
        >
          <Card
            title="页面配置"
            extra={(
              <Space>
                <Button.Group>
                  <Button type="primary" onClick={() => this.handleSave()}>保存</Button>
                  <Button onClick={() => onCancel && onCancel()}>取消</Button>
                  <Dropdown
                    overlay={(
                      <Menu>
                        <Menu.Item onClick={() => this.handleRefreshPreview()}>强制刷新</Menu.Item>
                        <Menu.Item onClick={() => {
                          copy(JSON.stringify(pageConfig))
                          message.info("复制成功")
                        }}>复制配置</Menu.Item>
                        <Menu.Item onClick={() => this.setState({ configStringify: true })}>配置文件</Menu.Item>
                      </Menu>
                    )}
                    getPopupContainer={(ele) => document.getElementById('ccms-config') || ele.parentElement || document.body}
                  >
                    <Button icon={(<DownOutlined />)}></Button>
                  </Dropdown>
                </Button.Group>
              </Space>
            )}
            tabList={[
              {
                key: '-1',
                tab: '基本信息'
              },
              ...PageTemplates[this.state.pageTemplate].map(({ label, step }, index) => ({ key: index.toString(), tab: label }))
            ]}
            activeTabKey={activeTab.toString()}
            onTabChange={(activeTab) => this.setState({ activeTab: Number(activeTab) })}
            tabProps={{ size: 'small' }}
            bordered={false}
          >
            {activeTab === -1 ? (
              <>
                <div>
                  <div>UI风格：</div>
                  <div>
                    <Radio.Group
                      size="small"
                      value={pageConfig.ui}
                      style={{ display: 'block', marginTop: 8 }}
                      defaultValue="antd"
                      onChange={(e) => {
                        const { pageConfig } = this.state
                        pageConfig.ui = e.target.value
                        this.setState({
                          pageConfig
                        })
                      }}
                    >
                      <Radio.Button value="antd">Ant Design</Radio.Button>
                    </Radio.Group>
                  </div>
                </div>
                <div style={{ marginTop: 16 }}>
                  <div>页面类型：</div>
                  <div>
                    <Radio.Group size="small" value={pageTemplate} style={{ display: 'block', marginTop: 8 }} onChange={(e) => this.handleChangePageMode(e.target.value)}>
                      <Radio.Button className="ccms-page-template" value="normal-table">
                        <div className="ccms-page-template-icon">
                          <div style={{ width: 18, height: 0, borderTop: '3px solid black', marginLeft: 4, marginBottom: 2, marginTop: 4 }}></div>
                          <div style={{ width: 18, height: 0, borderTop: '1px solid black', marginLeft: 4, marginBottom: 2 }}></div>
                          <div style={{ width: 18, height: 0, borderTop: '1px solid black', marginLeft: 4, marginBottom: 2 }}></div>
                          <div style={{ width: 18, height: 0, borderTop: '1px solid black', marginLeft: 4, marginBottom: 2 }}></div>
                          <div style={{ width: 18, height: 0, borderTop: '1px solid black', marginLeft: 4, marginBottom: 2 }}></div>
                          <div style={{ width: 18, height: 0, borderTop: '1px solid black', marginLeft: 4, marginBottom: 2 }}></div>
                        </div>
                        <span>普通列表</span>
                      </Radio.Button>
                      <Radio.Button className="ccms-page-template" value="filter-table">
                        <div className="ccms-page-template-icon">
                          <div style={{ width: 18, height: 3, marginLeft: 4, marginBottom: 3, marginTop: 4, display: 'flex' }}>
                            <div style={{ width: 10, height: 3, border: '1px solid black', marginRight: 2 }}></div>
                            <div style={{ width: 6, height: 0, borderTop: '3px solid black' }}></div>
                          </div>
                          <div style={{ width: 18, height: 0, borderTop: '3px solid black', marginLeft: 4, marginBottom: 2 }}></div>
                          <div style={{ width: 18, height: 0, borderTop: '1px solid black', marginLeft: 4, marginBottom: 2 }}></div>
                          <div style={{ width: 18, height: 0, borderTop: '1px solid black', marginLeft: 4, marginBottom: 2 }}></div>
                          <div style={{ width: 18, height: 0, borderTop: '1px solid black', marginLeft: 4, marginBottom: 2 }}></div>
                        </div>
                        <span>筛选列表</span>
                      </Radio.Button>
                      <Radio.Button className="ccms-page-template" value="normal-form">
                        <div className="ccms-page-template-icon">
                          <div style={{ width: 19, height: 5, display: 'flex', marginLeft: 4, marginBottom: 2, marginTop: 4 }}>
                            <div style={{ width: 4, height: 2, borderBottom: '1px solid black', marginRight: 1, opacity: 0.5 }}></div>
                            <div style={{ width: 13, height: 5, border: '1px solid black' }}></div>
                          </div>
                          <div style={{ width: 19, height: 7, display: 'flex', marginLeft: 4, marginBottom: 2}}>
                            <div style={{ width: 4, height: 2, borderBottom: '1px solid black', marginRight: 1, opacity: 0.5  }}></div>
                            <div style={{ width: 13, height: 7, border: '1px solid black' }}></div>
                          </div>
                          <div style={{ width: 19, height: 3, marginLeft: 9, display: 'flex' }}>
                            <div style={{ width: 6, height: 3, border: '1px solid black', marginRight: 1 }}></div>
                            <div style={{ width: 6, height: 3, border: '1px solid black' }}></div>
                          </div>
                        </div>
                        <span>普通表单</span>
                      </Radio.Button>
                      <Radio.Button className="ccms-page-template" value="edit-form">
                        <div className="ccms-page-template-icon">
                          <div style={{ width: 19, height: 5, display: 'flex', marginLeft: 4, marginBottom: 2, marginTop: 4 }}>
                            <div style={{ width: 4, height: 2, borderBottom: '1px solid black', marginRight: 1, opacity: 0.5 }}></div>
                            <div style={{ width: 13, height: 5, border: '1px solid black' }}>
                              <div style={{ width: 9, height: 0, borderTop: '1px solid black', marginLeft: 1, marginTop: 1 }}></div>
                            </div>
                          </div>
                          <div style={{ width: 19, height: 7, display: 'flex', marginLeft: 4, marginBottom: 2 }}>
                            <div style={{ width: 4, height: 2, borderBottom: '1px solid black', marginRight: 1, opacity: 0.5 }}></div>
                            <div style={{ width: 13, height: 7, border: '1px solid black' }}>
                              <div style={{ width: 9, height: 0, borderTop: '1px solid black', marginLeft: 1, marginTop: 1 }}></div>
                              <div style={{ width: 4, height: 0, borderTop: '1px solid black', marginLeft: 1, marginTop: 1 }}></div>
                            </div>
                          </div>
                          <div style={{ width: 19, height: 3, marginLeft: 9, display: 'flex' }}>
                            <div style={{ width: 6, height: 3, border: '1px solid black', marginRight: 1 }}></div>
                            <div style={{ width: 6, height: 3, border: '1px solid black' }}></div>
                          </div>
                        </div>
                        <span>编辑表单</span>
                      </Radio.Button>
                    </Radio.Group>
                    <Radio.Group size="small" value={pageTemplate} style={{ display: 'block', marginTop: 8 }} onChange={(e) => this.handleChangePageMode(e.target.value)}>
                      <Radio.Button className="ccms-page-template" value="detail">
                        <div className="ccms-page-template-icon">
                          <div style={{ width: 19, display: 'flex', marginLeft: 4, marginBottom: 2, marginTop: 4 }}>
                            <div style={{ width: 4, height: 2, borderBottom: '1px solid black', marginRight: 1, opacity: 0.5 }}></div>
                            <div>
                              <div style={{ width: 9, height: 0, borderTop: '1px solid black', marginTop: 1 }}></div>
                            </div>
                          </div>
                          <div style={{ width: 19, display: 'flex', marginLeft: 4, marginBottom: 2 }}>
                            <div style={{ width: 4, height: 2, borderBottom: '1px solid black', marginRight: 1, opacity: 0.5 }}></div>
                            <div>
                              <div style={{ width: 12, height: 0, borderTop: '1px solid black', marginTop: 1 }}></div>
                              <div style={{ width: 12, height: 0, borderTop: '1px solid black', marginTop: 1 }}></div>
                              <div style={{ width: 8, height: 0, borderTop: '1px solid black', marginTop: 1 }}></div>
                            </div>
                          </div>
                          <div style={{ width: 19, display: 'flex', marginLeft: 4, marginBottom: 2 }}>
                            <div style={{ width: 4, height: 2, borderBottom: '1px solid black', marginRight: 1, opacity: 0.5 }}></div>
                            <div style={{ display: 'flex' }}>
                              <div style={{ width: 2, height: 0, borderTop: '1px solid black', marginTop: 1 }}></div>
                              <div style={{ width: 2, height: 0, borderTop: '1px solid black', marginLeft: 1, marginTop: 1 }}></div>
                              <div style={{ width: 2, height: 0, borderTop: '1px solid black', marginLeft: 1, marginTop: 1 }}></div>
                            </div>
                          </div>
                          <div style={{ width: 19, height: 3, marginLeft: 9, display: 'flex' }}>
                            <div style={{ width: 6, height: 3, border: '1px solid black' }}></div>
                          </div>
                        </div>
                        <span>详情页面</span>
                      </Radio.Button>
                      <Radio.Button className="ccms-page-template" value="opera">
                        <div className="ccms-page-template-icon">
                          <div style={{ width: 18, height: 7, border: '1px solid black', marginLeft: 4, marginTop: 8, borderRadius: 2, display: 'flex', position: 'relative' }}>
                            <div style={{ width: 2, borderTop: '1px solid black', marginLeft: 2, marginTop: 2 }}></div>
                            <div style={{ width: 9, borderTop: '1px solid black', marginLeft: 1, marginTop: 2, opacity: 0.5 }}></div>
                            <div style={{ width: 8, borderTop: '1px solid black', position: 'absolute', left: 12, top: 4, transform: 'rotate(90deg)', transformOrigin: 'left top' }}></div>
                            <div style={{ width: 8, borderTop: '1px solid black', position: 'absolute', left: 12, top: 4, transform: 'rotate(35deg)', transformOrigin: 'left top' }}></div>
                          </div>
                        </div>
                        <span>操作按钮</span>
                      </Radio.Button>
                    </Radio.Group>
                  </div>
                </div>
              </>
            ) : (
              <>
                <CCMSForm
                  key={activeTab}
                  data={[{
                    ...(pageConfig.steps || [])[activeTab],
                    applicationName,
                    businessSuffix: type === 'business' ? '/business' : '',
                    version: this.props.version,
                    subversion: this.props.subversion,
                    configDomain: this.props.configDomain
                  }]}
                  config={(StepConfigs[((pageConfig.steps || [])[activeTab] || {}).type] || {}) as FormConfig}
                  onChange={(data) => {
                    const { pageConfig } = this.state
                    const { steps = [] } = pageConfig
                    steps[this.state.activeTab] = data
                    pageConfig.steps = steps
                    this.setState({
                      pageConfig
                    })
                  }}
                  loadDomain={this.props.loadDomain}
                  loadPageList={loadPageList}
                  baseRoute={this.props.baseRoute}
                />
              </>
            )}
          </Card>
        </Drawer>

        {/* 编辑配置文件 */}
        <Modal
          title="编辑配置文件"
          visible={this.state.configStringify}
          footer={false}
          onCancel={() => this.setState({ configStringify: false })}
          getContainer={() => document.getElementById('ccms-config') || document.body}
        >
          <ConfigJSON
            defaultValue={this.state.pageConfig}
            onOk={(pageConfig) => this.setState({ pageConfig, configStringify: false })}
            onCancel={() => this.setState({ configStringify: false })}
          />
        </Modal>
      </div>
    )
  }

}

export default App;
