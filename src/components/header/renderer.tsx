import './index.css';

import * as React from 'react';
import {Portal, PortalWithState} from 'react-portal';
import {withRouter} from 'react-router-dom';

import {LAYOUT, Mode} from '../../constants';
import {NAMES} from '../../constants/consts';
import {VEGA_LITE_SPECS, VEGA_SPECS} from '../../constants/specs';

const formatExampleName = (name) => {
  return name
    .split(/[_-]/)
    .map((i) => i[0].toUpperCase() + i.substring(1))
    .join(' ');
};

function isRawUrl(url) {
  const protocol = 'https?:';
  const host = 'gist\\.github(?:usercontent)?\\.com';
  const rawUrlPattern = new RegExp(
    `${protocol}//${host}/.+/.{32}/raw(?:/.{32})?(?:/.+)?/?`
  );

  return rawUrlPattern.test(url);
}

type Props = {
  mode: Mode;
};

type State = {
  customIsOpened?: boolean;
  left?: any;
  showVega: boolean;
  gist: {
    url: string;
    filename: string;
    revision: string;
  };
  width?: number;
  invalidUrl?: boolean;
};

class Header extends React.Component<Props & {history: any}, State> {
  refGistForm: HTMLFormElement;

  constructor(props) {
    super(props);
    // $FixMe - default state?
    this.state = {
      showVega: props.mode === Mode.Vega,
      gist: {
        url: '',
        filename: '',
        revision: '',
      },
    };
    this.onSelectVega = this.onSelectVega.bind(this);
  }
  public handleChange(gist) {
    this.setState({
      gist: {
        ...this.state.gist,
        ...gist,
      }
    });
  }
  public updateGistUrl(event) {
    this.handleChange({url: event.currentTarget.value});
  }
  public updateGistRevision(event) {
    this.handleChange({revision: event.currentTarget.value});
  }
  public updateGistFile(event) {
    this.handleChange({filename: event.currentTarget.value});
  }
  public onSelectVega(name) {
    this.props.history.push('/examples/vega/' + name);
  }
  public onSelectNewVega() {
    this.props.history.push('/custom/vega');
  }
  public onSelectVegaLite(name) {
    this.props.history.push('/examples/vega-lite/' + name);
  }
  public onSelectNewVegaLite() {
    this.props.history.push('/custom/vega-lite');
  }
  public async onSelectGist(gistType, closePortal) {
    const url = this.state.gist.url.trim().toLowerCase();
    const filename = this.state.gist.filename.trim();
    const revision = this.state.gist.revision.trim().toLowerCase();

    if (url.length === 0 || filename.length === 0) {
      this.refGistForm.checkValidity();

      return;
    }

    const gistUrl = new URL(url, 'https://gist.github.com');

    let rawUrl = gistUrl;

    if (isRawUrl(gistUrl) === false) {
      rawUrl = new URL(gistUrl.pathname, 'https://gist.githubusercontent.com');
      rawUrl.pathname += '/raw';

      if (revision !== '') {
        rawUrl.pathname += `/${revision}`;
      }

      rawUrl.pathname += `/${filename}`;
    }

    const response = await fetch(rawUrl.href, { mode: 'no-cors' });

    if (response.status === 404) {
      this.setState({invalidUrl: true});

      return;
    }

    const [username, gistId] = gistUrl.pathname.split('/').slice(1);

    let nextUrl = `/gist/${gistType}/${username}/${gistId}/${filename}`;

    if (revision !== '') {
      nextUrl = `${nextUrl}/${revision}`;
    }

    this.props.history.push(nextUrl);

    this.setState({
      gist: {
        url: '',
        revision: '',
        filename: '',
      },
      invalidUrl: false,
    });

    closePortal();
  }
  public onSelectVegaGist(closePortal) {
    this.onSelectGist('vega', closePortal);
  }
  public onSelectVegaLiteGist(closePortal) {
    this.onSelectGist('vega-lite', closePortal);
  }
  public render() {
    const examplesButton = (
      <div className='button'>
        {'Examples'}
      </div>
    );
    const gistButton = (
      <div className='button'>
        {'Gist'}
      </div>
    );
    const docsLink = (
      <a className='button right' href={this.props.mode === Mode.Vega ? 'https://vega.github.io/vega/docs/' : 'https://vega.github.io/vega-lite/docs/'} target='_blank' rel='noopener noreferrer'>
        {NAMES[this.props.mode]} Docs
      </a>
    );
    const customButton = (
      <div onMouseOver={(e) => {
          const targetRect = (e.target as any).getBoundingClientRect();
          this.setState({
            customIsOpened: true,
            left: targetRect.left,
          });
      }}>
        {'New'}
      </div>
    );
    const vega = (closePortal) => {
      return (
        <div className='vega'>
          {Object.keys(VEGA_SPECS).map((specType, i) => {
            const specs = VEGA_SPECS[specType];
            return (
              <div className='itemGroup' key={i}>
                <div className='specType'>{specType}</div>
                <div className='items'>
                  {specs.map((spec, j) => {
                    return (
                      <div key={j} onClick={() => {this.onSelectVega(spec.name); closePortal();}} className='item'>
                        <div style={{backgroundImage: `url(images/examples/vg/${spec.name}.vg.png)`}} className='img'/>
                        <div className='name'>{formatExampleName(spec.name)}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      );
    };
    const vegalite = (closePortal) => {
      return (
        <div className='vega-Lite'>
          {Object.keys(VEGA_LITE_SPECS).map((specType, i) => {
            const specs = VEGA_LITE_SPECS[specType];
            return (
              <div className='itemGroup' key={i}>
                <div className='specType'>{specType}</div>
                <div className='items'>
                  {specs.map((spec, j) => {
                    return (
                      <div key={j} onClick={() => {this.onSelectVegaLite(spec.name); closePortal();}} className='item'>
                        <div style={{backgroundImage: `url(images/examples/vl/${spec.name}.vl.png)`}} className='img'/>
                        <div className='name'>{spec.title}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      );
    };
    const gist = (closePortal) => {
      return (
        <div>
          <h2>Load Gist</h2>
          <div className='gist-content'>
            <form ref={(form) => this.refGistForm = form}>
              <label className='gist-input-container'>
                Gist URL
                <input required className='gist-input' type='text' placeholder='https://gist.github.com/domoritz/455e1c7872c4b38a58b90df0c3d7b1b9' value={this.state.gist.url} onChange={this.updateGistUrl.bind(this)}/>
              </label>
              <label className='gist-input-container'>
                Data Filename
                <input required className='gist-input' type='text' placeholder='Data Filename' value={this.state.gist.filename} onChange={this.updateGistFile.bind(this)}/>
              </label>
              <label className='gist-input-container'>
                Revision (<small>Optional</small>)
                <input className='gist-input' type='text' placeholder='Revison' value={this.state.gist.revision} onChange={this.updateGistRevision.bind(this)}/>
              </label>
              <div className='error-message'>{this.state.invalidUrl && <span>Please enter a valid URL.</span>}</div>
              <button className='gist-button' onClick={() => {this.onSelectVegaGist(closePortal);}}>
                Vega
              </button>
              <button className='gist-button' onClick={() => {this.onSelectVegaLiteGist(closePortal);}}>
                Vega-Lite
              </button>
            </form>
          </div>
        </div>
      );
    };
    return (
      <div className='header'>
        <a className='idl-logo' href='https://idl.cs.washington.edu/' target='_blank' rel='noopener noreferrer'>
          <img height={37} alt='IDL Logo' src='https://vega.github.io/images/idl-logo.png'/>
        </a>

        {this.state.customIsOpened && (
          <Portal>
            <div className='customSubmenuGroup'
              onMouseOver={() => {
                this.setState({customIsOpened: true});
              }}
              onMouseLeave={() => {
                this.setState({customIsOpened: false});
              }}
              onClick={() => {
                this.setState({customIsOpened: false});
              }}
              style={{
                left: this.state.left,
                width: this.state.width, // $FixMe
                position: 'absolute',
                cursor: 'pointer',
                zIndex: 1000000000,
                top: 0,
              }}
            >
              <div id='emptyButton' style={{height: LAYOUT.HeaderHeight}} />

              <div className='customSubmenu' onClick={() => this.onSelectNewVega()}>
                {'Vega'}
              </div>
              <div className='customSubmenu' onClick={() => this.onSelectNewVegaLite()}>
                {'Vega-Lite'}
              </div>
            </div>
          </Portal>
        )}
        <PortalWithState closeOnEsc>
          {({openPortal, closePortal, isOpen, portal}) => [
            <span key='0' onClick={openPortal}>
              {examplesButton}
            </span>,
            portal(
              <div className='modal-background' onClick={closePortal}>
                <div className='modal-header'>
                  <div className='button-groups' onClick={(e) => {e.stopPropagation();}}>
                    <button className={this.state.showVega ? 'selected' : ''}
                      onClick={() => {
                        this.setState({showVega: true});
                      }}
                    >
                      {'Vega'}
                    </button>
                    <button className={this.state.showVega ? '' : 'selected'}
                      onClick={() => {
                        this.setState({showVega: false});
                      }}
                    >
                      {'Vega-Lite'}
                    </button>
                  </div>
                  <button className='close-button' onClick={closePortal}>✖</button>
                </div>
                <div className='modal-area'>
                  <div className='modal' onClick={(e) => {e.stopPropagation();}}>
                    {this.state.showVega ? vega(closePortal) : vegalite(closePortal)}
                  </div>
                </div>
              </div>
            ),
          ]}
        </PortalWithState>
        <PortalWithState closeOnEsc>
          {({openPortal, closePortal, isOpen, portal}) => [
            <span key='0' onClick={openPortal}>
              {gistButton}
            </span>,
            portal(
              <div className='modal-background' onClick={closePortal}>
                <div className='modal-header'>
                <button className='close-button' onClick={closePortal}>✖</button>
                </div>
                <div className='modal-area'>
                  <div className='modal' onClick={(e) => {e.stopPropagation();}}>{gist(closePortal)}</div>
                </div>
              </div>
            ),
          ]}
        </PortalWithState>
        <span>{docsLink}</span>
        <span>{customButton}</span>
      </div>
    );
  }
}

export default withRouter(Header);
