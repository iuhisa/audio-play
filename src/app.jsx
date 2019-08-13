import React, { Component } from 'react';
import styled from 'styled-components';

class App extends Component {
  constructor(props){
    super(props);
    this.state = {
      audiosInfo: [], //音声のファイル名などの情報
      audiosSrc: [],  //音声をAudioObjectにインスタンス化して格納
      selected: -1,   //選択されている曲
      isPlaying: false, //再生中か否か
      mute: false,
      volume: 0.5,
      time: 0 //100%換算した値（厳密な現在の再生時間ではない）
    }
    //再生中のAudioObject
    this.playingAudio = null;
    this.dragging = false;

    this.addAudio = this.addAudio.bind(this);
    this.changeAudio = this.changeAudio.bind(this);
    this.setAudioCurrentTime = this.setAudioCurrentTime.bind(this);
    this.playAudio = this.playAudio.bind(this);
    this.removeAudio = this.removeAudio.bind(this);
    this.selectAudio = this.selectAudio.bind(this);
    this.endedHandle = this.endedHandle.bind(this);
    this.timeupdateHandle = this.timeupdateHandle.bind(this);
    this.changeVolume = this.changeVolume.bind(this);
    this.changeTime = this.changeTime.bind(this);
    this.changeMute = this.changeMute.bind(this);
  }

  //音声をinputしたとき
  addAudio(e){
    //新規追加ファイル格納用変数
    let additionalAudiosInfo = [];
    let additionalAudiosSrc = [];

    //inputしたファイル群
    const files = e.target.files;

    //ファイルをAudioObjectにインスタンス化
    for(let i=0; i<files.length; i++){
      additionalAudiosInfo.push(files[i]);
      const src = URL.createObjectURL(files[i]);
      const audio = new Audio(src);
      //再生終了イベントを付与
      audio.onended= this.endedHandle;
      audio.ontimeupdate = this.timeupdateHandle;
      additionalAudiosSrc.push(audio);
    }
    this.setState({
      audiosInfo: this.state.audiosInfo.concat(additionalAudiosInfo),
      audiosSrc: this.state.audiosSrc.concat(additionalAudiosSrc)
    });
  }

  endedHandle() {
    //新しい曲のindexを設定
    let selected = this.state.selected + 1;
    if(selected > this.state.audiosInfo.length-1){
      selected = this.state.selected;
      this.playingAudio.pause();
      this.playingAudio.currentTime = 0;
      this.setState({
        isPlaying: false
      });
      return;
    }

    //再生中の曲をリセット
    this.playingAudio.pause();
    this.playingAudio.currentTime = 0;

    //曲を更新
    this.playingAudio = this.state.audiosSrc[selected];
    this.playingAudio.volume = this.state.volume;
    this.playingAudio.muted  = this.state.mute;
    this.playingAudio.play();
    this.setState({
      selected: selected,
      isPlaying: true
    });
  }

  timeupdateHandle() {
    if(this.state.selected == -1){
      return;
    }

    //ドラッグ中なら処理を行わない
    if(this.dragging){
      return;
    }

    this.setState({
      time: 100 / this.playingAudio.duration * this.playingAudio.currentTime 
    });
  }

  //拡張子を削除
  splitExt(filename) {
    return filename.split(/\.(?=[^.]+$)/);
  }

  //曲を移動
  changeAudio(audioDif) {
    //曲が選択されていなければreturn
    if(this.state.selected == -1){
      return;
    }

    //新しい曲のindexを設定
    let selected = this.state.selected + audioDif;
    if(selected > this.state.audiosInfo.length-1){
      selected = this.state.selected;
      return;
    }else if(selected < 0){
      selected = this.state.selected;
      return;
    }

    //再生中の曲をリセット
    this.playingAudio.pause();
    this.playingAudio.currentTime = 0;

    //曲を更新
    this.playingAudio = this.state.audiosSrc[selected];
    this.playingAudio.volume = this.state.volume;
    this.playingAudio.muted  = this.state.mute;
    this.playingAudio.play();
    this.setState({
      selected: selected,
      isPlaying: true
    });
  }

  //x秒戻るor進む
  setAudioCurrentTime(timeDif) {
    if(this.stateselected != -1){
      this.playingAudio.currentTime = this.playingAudio.currentTime + timeDif;
    }
  }

  //音声を再生
  playAudio() {
    //曲が選択されていなければreturn
    if(this.state.selected == -1){
      return;
    }

    //再生中なら一時停止、一時停止中なら再生
    if(this.state.isPlaying){
      this.playingAudio.pause();
    }else{
      this.playingAudio.play();
    }
    this.setState({
      selectedAudio: true,
      isPlaying: !this.state.isPlaying
    });
  }

  //音声を削除
  removeAudio(index) {
    if(index == this.state.selected){
      this.playingAudio.pause();
      this.playingAudio.currentTime = 0;
      this.playingAudio = null;
      this.setState({
        selected: -1,
        isPlaying: false
      });
    }else if(index < this.state.selected){
      this.setState({
        selected: this.state.selected-1
      });
    }
    let audiosInfoCopy = this.state.audiosInfo;
    let audiosSrcCopy = this.state.audiosSrc;
    audiosInfoCopy.splice(index, 1);
    audiosSrcCopy.splice(index, 1);
    this.setState({
      audiosInfo: audiosInfoCopy,
      audiosSrc: audiosSrcCopy
    });
  }

  //音声を選択
  selectAudio(index) {
    if(this.state.isPlaying){
      this.playingAudio.pause();
      this.playingAudio.currentTime = 0;
    }
    this.playingAudio = this.state.audiosSrc[index];
    this.playingAudio.volume = this.state.volume;
    this.playingAudio.muted  = this.state.mute;
    this.playingAudio.play();
    this.setState({
      selected: index,
      isPlaying: true
    });
  }

  changeVolume(e){
    //曲が選択されていなければreturn
    if(this.state.selected == -1){
      return;
    }

    this.playingAudio.volume = e.target.value;
    this.state.volume = e.target.value;
  }

  changeTime(e){
    //曲が選択されていなければreturn
    if(this.state.selected == -1){
      return;
    }

    this.playingAudio.currentTime = e.target.value / 100 * this.playingAudio.duration;
    this.setState({
      time: e.target.value
    });
  }

  changeMute(){
    //曲が選択されていなければreturn
    if(this.state.selected == -1){
      return;
    }

    if(this.state.mute){
      this.playingAudio.muted = false;
      this.setState({
        mute: false
      });
    }else{
      this.playingAudio.muted = true;
      this.setState({
        mute: true
      });
    }
  }

  render() {
    return (
      <div>
        <Audios>
          {
            this.state.audiosInfo.map((file, index) => {
              if(index == this.state.selected){
                return(
                <AudioListSelected key={index}>
                    <AudioListTitle onClick={() => this.selectAudio(index)}>{this.splitExt(file.name)[0]}</AudioListTitle>
                    <RemoveAudioList onClick={() => this.removeAudio(index)}><svg width="22.0202" height="22.0202" version="1.1" viewBox="0 0 5.82618 5.82618" xmlns="http://www.w3.org/2000/svg"><g transform="translate(-166.803 -195.999)"><g transform="translate(113.583 118.845)" fill="none" stroke="#fff" strokeLinecap="round" strokeWidth=".529167"><path d="m53.4873 77.4214 5.29167 5.29167"/><path d="m58.779 77.4214-5.29167 5.29167"/></g></g></svg></RemoveAudioList>
                </AudioListSelected>
                );
              }else{
                return(
                  <AudioList key={index}>
                    <AudioListTitle onClick={() => this.selectAudio(index)}>{this.splitExt(file.name)[0]}</AudioListTitle>
                    <RemoveAudioList onClick={() => this.removeAudio(index)}><svg width="22.0202" height="22.0202" version="1.1" viewBox="0 0 5.82618 5.82618" xmlns="http://www.w3.org/2000/svg"><g transform="translate(-166.803 -195.999)"><g transform="translate(113.583 118.845)" fill="none" stroke="#fff" strokeLinecap="round" strokeWidth=".529167"><path d="m53.4873 77.4214 5.29167 5.29167"/><path d="m58.779 77.4214-5.29167 5.29167"/></g></g></svg></RemoveAudioList>
                  </AudioList>
                );
              }
            })
          }
        </Audios>
        <InputAudio id="input-audio" accept="audio/*" onChange={this.addAudio} type="file" multiple="multiple"/>
        <LabelInputAudio htmlFor="input-audio">音声を追加</LabelInputAudio>
        <ControlPanel>
          <AudioTitleWrapper>
            <AudioTitle>{this.state.selected != -1 ? this.splitExt(this.state.audiosInfo[this.state.selected].name)[0] : '選択されていません'}</AudioTitle>
          </AudioTitleWrapper>
          <SliderArea>
            <VolumeSlider>
              <SliderBody type="range" onInput={this.changeVolume} /*value={this.state.volumeSlider.volume}*/ min="0" max="1" step="0.01" defaultValue="0.5"/>
              <VolumeButton onClick={this.changeMute}>{this.state.mute? <svg version="1.1" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M4.34 2.93L2.93 4.34 7.29 8.7 7 9H3v6h4l5 5v-6.59l4.18 4.18c-.65.49-1.38.88-2.18 1.11v2.06c1.34-.3 2.57-.92 3.61-1.75l2.05 2.05 1.41-1.41L4.34 2.93zM10 15.17L7.83 13H5v-2h2.83l.88-.88L10 11.41v3.76zM19 12c0 .82-.15 1.61-.41 2.34l1.53 1.53c.56-1.17.88-2.48.88-3.87 0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zm-7-8l-1.88 1.88L12 7.76zm4.5 8c0-1.77-1.02-3.29-2.5-4.03v1.79l2.48 2.48c.01-.08.02-.16.02-.24z" fill="#fff"/></svg> : <svg version="1.1" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M3 9v6h4l5 5V4L7 9H3zm7-.17v6.34L7.83 13H5v-2h2.83L10 8.83zM16.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77 0-4.28-2.99-7.86-7-8.77z" fill="#fff"/></svg>}</VolumeButton>
            </VolumeSlider>
            <AudioSlider>
              <SliderBody type="range" /*value={this.state.audioSlider.time}*/ min="0" max="100" value={this.state.time} onMouseDown={() => this.dragging=true} onMouseUp={() => this.dragging=false} onChange={this.changeTime}/>
              <AudioIcon version="1.1" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6zm-2 16c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" fill="#fff"/></AudioIcon>
            </AudioSlider>
          </SliderArea>
          <ButtonArea>
            <OPButton onClick={() => this.changeAudio(-1)} disabled={this.state.selected == -1 ? true : false}><svg width="20.9756" height="22.0285" version="1.1" viewBox="0 0 5.54979 5.82837" xmlns="http://www.w3.org/2000/svg"><g transform="translate(-285.721 -81.7248)"><g transform="translate(61.7101 28.7877)"><g transform="matrix(-1 0 0 1 282.917 -31.2797)" fill="none" stroke="#fff" strokeLinecap="round" strokeWidth=".529167"><path d="m53.6238 84.6878 4.23333 2.44412-4.23333 2.44412 1e-6 -4.88823" strokeLinejoin="round"/><path d="m58.6411 84.4851v5.29167"/></g></g></g></svg></OPButton>
            <OPButton onClick={() => this.setAudioCurrentTime(-2)} disabled={this.state.selected == -1 ? true : false}><svg width="12.01" height="22.0202" version="1.1" viewBox="0 0 3.17766 5.82618" xmlns="http://www.w3.org/2000/svg"><g transform="translate(-281.359 -61.3613)"><g transform="translate(53.4565 -52.1323)"><path d="m230.813 113.761-2.64583 2.64584 2.64583 2.64583" fill="none" stroke="#fff" strokeLinecap="round" strokeLinejoin="round" strokeWidth=".529167"/></g></g></svg></OPButton>
            <OPButton onClick={this.playAudio} disabled={this.state.selected == -1 ? true : false}>{this.state.isPlaying ? <svg width="7.33353" height="22.0285" version="1.1" viewBox="0 0 1.94033 5.82837" xmlns="http://www.w3.org/2000/svg"><g transform="translate(-290.432 -112.167)"><g transform="translate(240.809 27.23)" fill="none" stroke="#fff" strokeLinecap="round"><path d="m49.8871 85.2056v5.29167" strokeWidth=".529167"/><path d="m51.2982 85.2056v5.29167" strokeWidth=".529167"/></g></g></svg> : <svg width="18.0122" height="20.4894" version="1.1" viewBox="0 0 4.76574 5.42115" xmlns="http://www.w3.org/2000/svg"><g transform="translate(-286.157 -64.3843)"><g transform="translate(39.7904 -36.7233)"><path d="m246.635 101.376 4.23333 2.44412-4.23333 2.44411v-4.88823" fill="none" stroke="#fff" strokeLinecap="round" strokeLinejoin="round" strokeWidth=".529167"/></g></g></svg>}</OPButton>
            <OPButton onClick={() => this.setAudioCurrentTime(2)} disabled={this.state.selected == -1 ? true : false}><svg width="12.01" height="22.0202" version="1.1" viewBox="0 0 3.17766 5.82618" xmlns="http://www.w3.org/2000/svg"><g transform="translate(-279.121 -68.1361)"><g transform="translate(51.2181 -45.3575)"><path d="m228.17 113.761 2.64583 2.64584-2.64583 2.64583" fill="none" stroke="#fff" strokeLinecap="round" strokeLinejoin="round" strokeWidth=".529167"/></g></g></svg></OPButton>
            <OPButton onClick={() => this.changeAudio(1)} disabled={this.state.selected == -1 ? true : false}><svg width="20.9756" height="22.0285" version="1.1" viewBox="0 0 5.54979 5.82837" xmlns="http://www.w3.org/2000/svg"><g transform="translate(-290.545 -75.4986)"><g transform="translate(66.5338 22.5616)"><g transform="translate(170.655 -31.2797)" fill="none" stroke="#fff" strokeLinecap="round" strokeWidth=".529167"><path d="m53.6238 84.6878 4.23333 2.44412-4.23333 2.44412 1e-6 -4.88823" strokeLinejoin="round"/><path d="m58.6411 84.4851v5.29167"/></g></g></g></svg></OPButton>
          </ButtonArea>
        </ControlPanel>
      </div>
    );
  }
}

const ControlPanel = styled.div`
  background-color: #262626;
  bottom: 0;
  box-shadow: 0px -1px 12px 0px rgba(0,0,0,0.4);
  height: 140px;
  min-width: 280px;
  position: fixed;
  width: 100%;
`;

const AudioTitleWrapper = styled.div`
  margin: 0 auto;
  text-align: center;
  width: 200px;
`;

const AudioTitle = styled.h2`
  color: white;
  display: inline-block;
  font-size: 16px;
  font-weight: normal; 
  height: 20px;
  line-height: 20px;
  margin-top: 15px;
  margin-bottom: 5px;
  text-align: left;
`;

const InputAudio = styled.input`
  display: none;
`;
  
const LabelInputAudio = styled.label`
  background-color: dodgerblue;
  border-radius: 20px;
  color: white;
  cursor: pointer;
  display: block;
  font-weight: bold;
  font-size: 14px;
  height: 40px;
  line-height: 40px;
  margin: 0 auto 160px auto;
  text-align: center;
  width: 160px;

  &:hover {
    background-color: #0e80ef;
  }
`;

const OPButton = styled.button`
  cursor: pointer;
  height: 20px;
  width: 50px;

  svg {
    height: 20px;
    width: auto;
  }

  &:hover path{
    stroke: dodgerblue;
  }
`;

const SliderArea = styled.div`
  height 40px;
`;

const Audios = styled.ul`
  min-height: calc(100vh - 160px - 40px);
  padding: 50px 0;
`;

const AudioList = styled.li`
  align-items: center;
  border-bottom: solid 4px transparent;
  color: white;
  cursor: pointer;
  display: flex;
  height: auto;
  justify-content: center;
  margin: 0 auto;
  min-height: 40px;
  width: 236px;
  
  &:not(:first-child){
    margin-top: 20px;
  }
`;

const AudioListSelected = styled.li`
  align-items: center;
  border-bottom: solid 4px dodgerblue;
  color: white;
  cursor: pointer;
  display: flex;
  height: auto;
  justify-content: center;
  margin: 0 auto;
  min-height: 40px;
  width: 236px;
  
  &:not(:first-child){
    margin-top: 20px;
  }
`;

const AudioListTitle = styled.span`
  font-size: 14px;
  text-align: left;
  width: 200px;
`;

const RemoveAudioList = styled.button`
  display: inline-block;
  margin-left: 20px;
  
  svg {
    height: 16px;
    width: 16px;
  }

  &:hover path {
    stroke: dodgerblue;
  }
`;

const ButtonArea = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;
  height: 60px;
`;

const VolumeSlider = styled.div`
  align-items: center;
  display: flex;
  height: 20px;
  justify-content: center;
`;

const AudioSlider = styled.div`
  align-items: center;
  display: flex;
  height: 20px;
  justify-content: center;
`;

const SliderBody = styled.input`
  -webkit-appearance: none;
  width: 200px;
  
  &:focus {
    outline: none;
  }

  /* WebKit・Blink向け 溝のスタイル */
  &::-webkit-slider-runnable-track {
    width: 100%;
    height: 4px;
    cursor: pointer;
    background: #cccccc;
  }

  /* WebKit・Blink向け つまみのスタイル */
  &::-webkit-slider-thumb {
    height: 12px;
    width: 12px;
    border-radius: 6px;
    background: #ffffff;
    cursor: pointer;
    -webkit-appearance: none;
    /* 以下は つまみの縦位置調整 */
    margin-top: -4px;  /* (つまみの高さ - トラックの高さ) / 2 。つまみの高さは border を含む */	
  }
  
  /* 何故か上の margin-top 指定が Edge に効いてしまうので、Edge向けに設定をリセット */
  @supports (-ms-ime-align: auto) {
    &::-webkit-slider-thumb {
      margin-top: 0 !important;
    }
  }

  /* Firefox向け 溝のスタイル */
  &::-moz-range-track {
    width: 100%;
    height: 4px;
    cursor: pointer;
    background: #cccccc;
  }
  /* Firefox向け つまみのスタイル */
  &::-moz-range-thumb {
    height: 12px;
    width: 12px;
    border-radius: 6px;
    background: #ffffff;
    cursor: pointer;
  }

  /* Edge・IE向け 溝のスタイル */
  &::-ms-track {
    width: 100%;
    height: 4px;
    cursor: pointer;
    background: transparent;
    border-color: transparent;
    border-width: 8px;
    color: transparent;
  }
  /* Edge・IE向け 溝の色（つまみより左側） */
  &::-ms-fill-lower {
    background: #cccccc;
  }
  /* Edge・IE向け 溝の色（つまみより右側） */
  &::-ms-fill-upper {
    background: #cccccc;
  }
  /* Edge・IE向け つまみのスタイル */
  &::-ms-thumb {
    height: 12px;
    width: 12px;
    border-radius: 6px;
    background: #ffffff;
    cursor: pointer;
  }

  /* Edge・IE向け ポップアップを非表示に */
  &::-ms-tooltip {
    display: none;
  }
`;

const VolumeButton = styled.button`
  svg {
    height: 20px;
    width: 20px;
  }

  &:hover path:nth-child(2) {
    fill: dodgerblue;
  }
`;

const AudioIcon = styled.svg`
  height: 20px;
  width: 20px;
`;

export default App;
