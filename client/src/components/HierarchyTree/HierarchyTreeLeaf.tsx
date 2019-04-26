import * as React from 'react';
import { IAgentRecord, IPageRecord } from '../../models/alvisProject';
import { Button } from 'react-bootstrap';
import { Icon } from '../Icon/Icon';

const style = require('./HierarchyTreeLeaf.scss');

export interface HierarchyTreeLeafProps {
  page: IPageRecord;
  supAgent: IAgentRecord;

  onPageClick: (page: IPageRecord) => void;
  onPageDelete: (pageInternalId: string) => () => void;
  onPageChangeName: (page: IPageRecord, newName: string) => void;
}

export interface HierarchyTreeLeafState {
  isDuringNameChange: boolean;
}

export class HierarchyTreeLeaf extends React.Component<
  HierarchyTreeLeafProps,
  HierarchyTreeLeafState
> {
  constructor(props: HierarchyTreeLeafProps) {
    super(props);

    this.state = {
      isDuringNameChange: false,
    };
  }

  private nameInput = React.createRef<HTMLInputElement>();
  private acceptBtn = React.createRef<HTMLButtonElement>();

  private startPageChangingName = () => {
    this.setState({ isDuringNameChange: true }, () => {
      this.nameInput.current.focus();
    });
  };

  private rejectPageNameChange = () => {
    this.setState({ isDuringNameChange: false });
  };

  private acceptPageNameChange = () => {
    const newName = this.nameInput.current.value;

    this.setState({ isDuringNameChange: false }, () => {
      const { page, onPageChangeName } = this.props;

      onPageChangeName(page, newName);
    });
  };

  private handleNameInputKeyPress = (
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === 'Enter') {
      this.acceptPageNameChange();
    }
  };

  private handleNameInputBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    if (event.relatedTarget !== this.acceptBtn.current) {
      this.rejectPageNameChange();
    }
  };

  renderBtns() {
    const { isDuringNameChange } = this.state;
    const { page, onPageDelete } = this.props;

    // TODO: store 'System' name in some config!
    if (isDuringNameChange || page.name === 'System') {
      return null;
    }

    return (
      <>
        <div className="c-hierarchy-tree-leaf__action-btns">
          <button
            type="button"
            title={'Change page name'}
            className="c-hierarchy-tree-leaf__btn"
            disabled={false}
            onClick={this.startPageChangingName}
          >
            <Icon
              icon="edit"
              extraClasses={['c-hierarchy-tree-leaf__btn-icon']}
            />
          </button>
          <button
            type="button"
            title={'Delete page'}
            className="c-hierarchy-tree-leaf__btn"
            disabled={false}
            onClick={onPageDelete(page.internalId)}
          >
            <Icon
              icon="delete"
              extraClasses={['c-hierarchy-tree-leaf__btn-icon']}
            />
          </button>
        </div>
      </>
    );
  }

  renderNameInput() {
    const { isDuringNameChange } = this.state;
    const { page } = this.props;

    if (!isDuringNameChange) {
      return null;
    }

    return (
      <>
        <input
          type="text"
          className="c-hierarchy-tree-leaf__input"
          defaultValue={page.name}
          onKeyPress={this.handleNameInputKeyPress}
          onBlur={this.handleNameInputBlur}
          ref={this.nameInput}
        />
        <div className="c-hierarchy-tree-leaf__action-btns">
          <button
            type="button"
            title={'Accept'}
            className="c-hierarchy-tree-leaf__input-btn"
            onClick={this.acceptPageNameChange}
            ref={this.acceptBtn}
          >
            <Icon
              icon="check"
              extraClasses={['c-hierarchy-tree-leaf__btn-icon']}
            />
          </button>
          <button
            type="button"
            title={'Cancel'}
            className="c-hierarchy-tree-leaf__input-btn"
            onClick={this.rejectPageNameChange}
          >
            <Icon
              icon="close"
              extraClasses={['c-hierarchy-tree-leaf__btn-icon']}
            />
          </button>
        </div>
      </>
    );
  }

  renderLink() {
    const { isDuringNameChange } = this.state;
    const { page, supAgent, onPageClick } = this.props;

    if (isDuringNameChange) {
      return null;
    }

    return (
      <Button bsStyle="link" bsSize="small" onClick={() => onPageClick(page)}>
        {page.name}
        {supAgent && ` < ${supAgent.name}`}
      </Button>
    );
  }

  render() {
    return (
      <div className="c-hierarchy-tree-leaf">
        {this.renderNameInput()}
        {this.renderLink()}
        {this.renderBtns()}
      </div>
    );
  }
}
